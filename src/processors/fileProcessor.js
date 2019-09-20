

const Action = require('action-js');
const makeTokenModel = require('../models/token');
const { NotFoundError, ParameterError } = require('../models/errors');
const jwt = require('../helpers/jwt');
const base64 = require('../helpers/base64');

function makeFileProcessor(context) {
  const { signatureKey } = context.env;
  const tokenModel = makeTokenModel(context);

  function getFile(token) {
    return new Action((cb) => {
      try {
        const json = base64.urlDecode(token);
        if (!json) throw new ParameterError('invalid file id');
        const { jti, c: url, b: mimeType } = JSON.parse(json);

        if (tokenModel.isCancelled(jti)) {
          throw new NotFoundError('User has cancelled beam');
        }
        tokenModel.updateViews(jti);
        cb({ url, mimeType });
      } catch (err) {
        cb(err);
      }
    });
  }

  function getFileWithSignature(token) {
    return new Action((cb) => {
      try {
        const { jti, c: url, b: mimeType } = jwt.decode(token, signatureKey, false, 'HS256');
        if (tokenModel.isCancelled(jti)) {
          throw new NotFoundError('User has cancelled beam');
        }
        tokenModel.updateViews(jti);
        cb({ url, mimeType });
      } catch (err) {
        cb(err);
      }
    });
  }

  return {
    getFile,
    getFileWithSignature,
  };
}

module.exports = makeFileProcessor;
