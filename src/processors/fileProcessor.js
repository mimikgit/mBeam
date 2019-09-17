

const Action = require('action-js');
const makeTokenModel = require('../models/token');
const jwt = require('../helpers/jwt');
const base64 = require('../helpers/base64');

function makeFileProcessor(context) {
  const { signatureKey } = context.env;
  const tokenModel = makeTokenModel(context);

  function getFile(token) {
    return new Action((cb) => {
      try {
        const json = base64.urlDecode(token);
        if (!json) throw new Error('invalid file id');
        const { jti, c, b } = JSON.parse(json);

        if (tokenModel.isCancelled(jti)) {
          throw new Error(JSON.stringify({
            message: 'User has cancelled beam',
            statusCode: 404,
          }));
        }
        tokenModel.updateViewCount(jti);
        cb({ url: c, mimeType: b });
      } catch (err) {
        cb(err);
      }
    });
  }

  function getFileWithSignature(token) {
    return new Action((cb) => {
      try {
        const { jti, c, b } = jwt.decode(token, signatureKey, false, 'HS256');
        if (tokenModel.isCancelled(jti)) {
          throw new Error(JSON.stringify({
            message: 'User has cancelled beam',
            statusCode: 404,
          }));
        }
        tokenModel.updateViewCount(jti);
        cb({ url: c, mimeType: b });
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
