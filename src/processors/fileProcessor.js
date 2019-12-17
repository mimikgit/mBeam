const Action = require('action-js');
const { NotFoundError, ParameterError } = require('@mimik/edge-ms-helper/error-helper');
const jwt = require('../lib/jwt');
const makeTokenModel = require('../models/token');
const base64 = require('../lib/base64');

function makeFileProcessor(context) {
  const tokenModel = makeTokenModel(context);

  // No signature verification, only used when ownerCode provided
  function getFile(token) {
    return new Action((cb) => {
      try {
        const json = base64.urlDecode(token);
        if (!json) throw new ParameterError('invalid file id');
        const { c: url, b: mimeType } = JSON.parse(json);

        cb({ url, mimeType });
      } catch (err) {
        cb(err);
      }
    });
  }

  function getFileWithSignature(token) {
    return new Action((cb) => {
      const { jti, c: url, b: mimeType } = jwt.decode(token, null, true, 'HS256');
      if (tokenModel.isCancelled(jti)) {
        throw new NotFoundError('User has cancelled beam');
      }
      tokenModel.updateViews(jti);
      cb({ url, mimeType });
    });
  }

  return {
    getFile,
    getFileWithSignature,
  };
}

module.exports = makeFileProcessor;
