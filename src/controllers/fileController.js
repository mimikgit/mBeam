import response from '../helper/response';
import fileProcessor from '../processors/fileProcessor';

function getFile(req, res) {
  const { ownerCode, id } = req.swagger.params;
  const { mimikContext } = req;

  if (ownerCode) {
    if (ownerCode !== mimikContext.env.ownerCode) {
      response.sendError({ message: 'incorrect ownerCode' }, 403, res);
    } else {
      fileProcessor.getFile(id)
        .next(data => response.writeMimeFile(data.url, data.mimeType, res))
        .guard(err => response.sendError(err, 400, res))
        .go();
    }
  } else {
    const { signatureKey } = req.mimikContext.env;
    if (!signatureKey) {
      response.sendError({ message: 'edge container is missing "signatureKey"' }, 403, res);
    } else {
      fileProcessor.getFileWithSignature(id, signatureKey)
        .next(data => response.writeMimeFile(data.url, data.mimeType, res))
        .guard(err => response.sendError(err, 400, res))
        .go();
    }
  }
}

function createToken(req, res) {
  const { mimikContext, body } = req;
  const { ownerCode } = req.swagger.params;
  const { signatureKey } = mimikContext.env;

  if (ownerCode !== mimikContext.env.ownerCode) {
    response.sendError({ message: 'incorrect ownerCode' }, 403, res);
  } else if (!signatureKey) {
    response.sendError({ message: 'edge container is missing "signatureKey"' }, 403, res);
  } else {
    fileProcessor.createToken(body, signatureKey)
      .next(token => response.sendResult(token, 200, res))
      .guard(err => response.sendError(err, 400, res))
      .go();
  }
}

module.exports = {
  getFile,
  createToken,
};
