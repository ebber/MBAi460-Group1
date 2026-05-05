//
// API function: GET /images/search?label=X
//
// Case-insensitive search for images that contain a given label (partial match ok).
// Returns: { message, data: [{assetid, label, confidence}] } ordered by assetid, label asc
//

const { get_dbConn } = require('./helper.js');
const pRetry = (...args) => import('p-retry').then(({default: pRetry}) => pRetry(...args));


exports.get_images_search = async (request, response) => {

  const label = request.query.label;

  if (!label) {
    return response.status(400).json({ "message": "missing required query param: label", "data": [] });
  }

  async function try_search() {
    let dbConn;
    try {
      dbConn = await get_dbConn();

      let [rows] = await dbConn.execute(
        `SELECT assetid, label, confidence
         FROM labels
         WHERE label LIKE ?
         ORDER BY assetid ASC, label ASC`,
        [`%${label}%`]
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
    console.log("**Call to GET /images/search...");
    let rows = await pRetry(() => try_search(), {retries: 2});

    response.json({ "message": "success", "data": rows });
  }
  catch (err) {
    console.log("ERROR:");
    console.log(err.message);
    response.status(500).json({ "message": err.message, "data": [] });
  }
};
