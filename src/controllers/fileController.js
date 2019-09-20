const response = require('edge-ms-helper/response-helper');
const makeFileProcessor = require('../processors/fileProcessor');
const { ParameterError } = require('../models/errors');

function getFile(req, res) {
  const { ownerCode, id } = req.swagger.params;
  const { context } = req;
  const fileProcessor = makeFileProcessor(context);

  if (ownerCode) {
    if (ownerCode !== context.env.ownerCode) {
      response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
    } else {
      fileProcessor.getFile(id)
        .next(data => res.writeMimeFile(data.url, data.mimeType))
        .guard(error => response.sendHttpError(error, res))
        .go();
    }
  } else if (!context.env.signatureKey) {
    response.sendHttpError(new ParameterError('edge container is missing "signatureKey"'), res);
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
