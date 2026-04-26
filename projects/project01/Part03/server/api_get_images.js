//
// API function: GET /images
//
// Returns all images in the database, optionally filtered by userid.
//

const { get_dbConn } = require('./helper.js');
const pRetry = (...args) => import('p-retry').then(({default: pRetry}) => pRetry(...args));


exports.get_images = async (request, response) => {

  const userid = request.query.userid;

  async function try_get_images() {
    let dbConn;
    try {
      dbConn = await get_dbConn();

      let sql, params;
      if (userid !== undefined) {
        sql = `SELECT assetid, userid, localname, bucketkey
               FROM assets
               WHERE userid = ?
               ORDER BY assetid ASC;`;
        params = [userid];
      } else {
        sql = `SELECT assetid, userid, localname, bucketkey
               FROM assets
               ORDER BY assetid ASC;`;
        params = [];
      }

      console.log("executing SQL...");
      let [rows, _] = await dbConn.execute(sql, params);
      console.log(`done, retrieved ${rows.length} rows`);
      return rows;
    }
    catch (err) {
      console.log("ERROR in try_get_images:");
      console.log(err.message);
      throw err;
    }
    finally {
      try { await dbConn.end(); } catch(err) { /*ignore*/ }
    }
  }

  try {
    console.log("**Call to GET /images...");
    let rows = await pRetry(() => try_get_images(), {retries: 2});

    response.json({
      "message": "success",
      "data": rows,
    });
  }
  catch (err) {
    console.log("ERROR:");
    console.log(err.message);
    response.status(500).json({
      "message": err.message,
      "data": [],
    });
  }
};
