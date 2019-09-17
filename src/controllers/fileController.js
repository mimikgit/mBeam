const response = require('edge-ms-helper/response-helper');
const makeFileProcessor = require('../processors/fileProcessor');

function getFile(req, res) {
  const { ownerCode, id } = req.swagger.params;
  const { context } = req;
  const fileProcessor = makeFileProcessor(context);

  if (ownerCode) {
    if (ownerCode !== context.env.ownerCode) {
      response.sendError({ message: 'incorrect ownerCode' }, 403, res);
    } else {
      fileProcessor.getFile(id)
        .next(data => res.writeMimeFile(data.url, data.mimeType))
        .guard((err) => {
          try {
            const json = JSON.parse(err.message);
            response.sendError(json.message, json.statusCode, res);
          } catch (e) {
            response.sendError(err, 400, res);
          }
        })
        .go();
    }
  } else if (!context.env.signatureKey) {
    response.sendError({ message: 'edge container is missing "signatureKey"' }, 403, res);
  } else {
    fileProcessor.getFileWithSignature(id)
      .next(data => res.writeMimeFile(data.url, data.mimeType))
      .guard((err) => {
        try {
          const json = JSON.parse(err.message);
          response.sendError(json, json.statusCode, res);
        } catch (e) {
          response.sendError(err, 400, res);
        }
      })
      .go();
  }
}

module.exports = {
  getFile,
};
