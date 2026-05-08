// GET /images_with_label/:label — search assets by label substring
//
// PDF spec response: { message: 'success', data: [<image>, ...] }
// PDF spec error envelope: { message: 'label is required', data: [] } @ 400
//
// Consumes lib's services.photoapp.searchImages(label). Lib does the
// %label% substring binding + JOIN against assets ordered by assetid +
// label ASC; the route validates label-presence + adapts the sentinel
// error to the spec's 400 envelope shape.

const { services } = require('../../src/photoapp-core');

module.exports = async function getImagesWithLabel(req, res, next) {
  try {
    const label = req.params.label;
    if (!label || !label.trim()) {
      return res.status(400).json({
        message: 'label is required',
        data: [],
      });
    }

    let data;
    try {
      data = await services.photoapp.searchImages(label);
    } catch (err) {
      if (err && err.message === 'label is required') {
        return res.status(400).json({
          message: 'label is required',
          data: [],
        });
      }
      throw err;
    }

    res.status(200).json({ message: 'success', data });
  } catch (err) {
    next(err);
  }
};
