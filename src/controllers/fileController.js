const response = require('edge-ms-helper/response-helper');
const makeFileProcessor = require('../processors/fileProcessor');

function getFile(req, res) {
  const { ownerCode, id } = req.swagger.params;
  const { context } = req;
  const fileProcessor = makeFileProcessor(context);

  if (ownerCode) {
    fileProcessor.getFile(id)
      .next(data => res.writeMimeFile(data.url, data.mimeType))
      .guard(error => response.sendHttpError(error, res))
      .go();
  } else {
    fileProcessor.getFileWithSignature(id)
      .next(data => res.writeMimeFile(data.url, data.mimeType))
      .guard(error => response.sendHttpError(error, res))
      .go();
  }
}

module.exports = {
  getFile,
};
