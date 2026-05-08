// GET /image/:assetid — download an image by assetid as base64 in JSON
//
// PDF spec response: { message: 'success', userid, local_filename, data }
// PDF spec error envelope: { message: 'no such assetid', userid: -1 } @ 400
//                          { message: 'assetid must be an integer', userid: -1 } @ 400
//
// Consumes lib's services.photoapp.downloadImage(assetid). The lib's CL9
// 2026-05-04 change adds `userid` to the return shape (previously only
// bucketkey/localname/contentType/s3Result) so this route doesn't need
// a separate DB lookup to fulfill the PDF response shape.
//
// Streams s3Result.Body via async iterator (AWS SDK v3 default) or the
// transformToByteArray helper as fallback; concatenates to buffer; emits
// base64.

const { services } = require('../../src/photoapp-core');

module.exports = async function getImage(req, res, next) {
  try {
    const assetid = parseInt(req.params.assetid, 10);
    if (Number.isNaN(assetid)) {
      return res.status(400).json({
        message: 'assetid must be an integer',
        userid: -1,
      });
    }

    let result;
    try {
      result = await services.photoapp.downloadImage(assetid);
    } catch (err) {
      if (err && err.message === 'no such assetid') {
        return res.status(400).json({
          message: 'no such assetid',
          userid: -1,
        });
      }
      throw err;
    }

    const { userid, localname, s3Result } = result;

    // Stream s3Result.Body to buffer; AWS SDK v3 returns a Readable stream.
    const chunks = [];
    if (s3Result.Body && typeof s3Result.Body[Symbol.asyncIterator] === 'function') {
      for await (const chunk of s3Result.Body) {
        chunks.push(chunk);
      }
    } else if (s3Result.Body && typeof s3Result.Body.transformToByteArray === 'function') {
      const bytes = await s3Result.Body.transformToByteArray();
      chunks.push(Buffer.from(bytes));
    } else {
      throw new Error('unexpected s3 response body shape');
    }
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');

    res.status(200).json({
      message: 'success',
      userid,
      local_filename: localname,
      data: base64,
    });
  } catch (err) {
    next(err);
  }
};
