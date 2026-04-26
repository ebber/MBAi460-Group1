//
// API function: GET /image/:assetid/labels
//
// Returns Rekognition labels for an image.
// Returns: { message, data: [{label, confidence}] } ordered by label asc
//

const { get_dbConn } = require('./helper.js');
const pRetry = (...args) => import('p-retry').then(({default: pRetry}) => pRetry(...args));


exports.get_image_labels = async (request, response) => {

  const assetid = parseInt(request.params.assetid);

  async function try_get_labels() {
    let dbConn;
    try {
      dbConn = await get_dbConn();

      // validate assetid exists:
      let [assetRows] = await dbConn.execute(
        `SELECT assetid FROM assets WHERE assetid = ?`, [assetid]
      );
      if (assetRows.length === 0) {
        const err = new Error("no such assetid");
        err.statusCode = 404;
        throw err;
      }

      let [rows] = await dbConn.execute(
        `SELECT label, confidence FROM labels WHERE assetid = ? ORDER BY label ASC`,
        [assetid]
      );
      return rows;
    }
    catch (err) {
      throw err;
    }
    finally {
      try { await dbConn.end(); } catch(e) { /*ignore*/ }
    }
  }

  try {
    console.log("**Call to GET /image/:assetid/labels...");
    let rows = await pRetry(() => try_get_labels(), {
      retries: 2,
      shouldRetry: (err) => !err.statusCode
    });

    response.json({ "message": "success", "data": rows });
  }
  catch (err) {
    console.log("ERROR:");
    console.log(err.message);
    if (err.statusCode === 404) {
      response.status(404).json({ "message": err.message });
    } else {
      response.status(500).json({ "message": err.message, "data": [] });
    }
  }
};
