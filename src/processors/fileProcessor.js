

const Action = require('action-js');
const uuid = require('../helpers/uuid');
const jwt = require('../helpers/jwt');
const base64 = require('../helpers/base64');

function makeFileProcessor(context) {
  const { signatureKey } = context.env;

  function getFile(fileId) {
    return new Action((cb) => {
      try {
        const json = base64.urlDecode(fileId);
        if (!json) {
          throw new Error('invalid file id');
        }
        const beamFile = JSON.parse(json);
        const mimeType = beamFile.b;
        const url = beamFile.c;
        cb({ url, mimeType });
      } catch (err) {
        cb(err);
      }
    });
  }

  function getFileWithSignature(fileId) {
    return new Action((cb) => {
      try {
        const beamFile = jwt.decode(fileId, signatureKey, false, 'HS256');
        const mimeType = beamFile.b;
        const url = beamFile.c;
        cb({ url, mimeType });
      } catch (err) {
        cb(err);
      }
    });
  }

  function createToken(json) {
    return new Action((cb) => {
      const tokenRequest = JSON.parse(json);
      const { url, mimeType, expIn } = tokenRequest;
      const exp = Math.round(new Date(new Date().getTime() + (expIn * 1000)).getTime() / 1000);
      if (!signatureKey) {
        throw new Error('edge container is missing "signatureKey"');
      }
      try {
        const token = jwt.encode({
          jti: uuid.generate(),
          b: mimeType,
          c: url,
          exp,
        }, signatureKey);

        const data = {
          token,
          expires_in: exp,
          url: `/files?id=${token}`,
        };

        cb({ data });
      } catch (err) {
        cb(err);
      }
    });
  }

  return {
    getFile,
    getFileWithSignature,
    createToken,
  };
}

module.exports = makeFileProcessor;
