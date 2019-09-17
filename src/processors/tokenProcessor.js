

const Action = require('action-js');
const makeTokenModel = require('../models/token');
const uuid = require('../helpers/uuid');
const jwt = require('../helpers/jwt');

function makeTokenProcessor(context) {
  const { signatureKey } = context.env;
  const tokenModel = makeTokenModel(context);

  function createToken(json) {
    return new Action((cb) => {
      const tokenRequest = JSON.parse(json);
      const { url, mimeType, expIn } = tokenRequest;
      const exp = Math.round(new Date(new Date().getTime() + (expIn * 1000)).getTime() / 1000);
      if (!signatureKey) {
        throw new Error('edge container is missing "signatureKey"');
      }
      try {
        const id = uuid.generate();
        const token = jwt.encode({
          jti: id,
          b: mimeType,
          c: url,
          exp,
        }, signatureKey);

        cb(tokenModel.insert({
          id,
          token,
          expires_in: exp,
          url: `/files?id=${token}`,
          status: 'active',
          viewCount: 0,
        }));
      } catch (err) {
        cb(err);
      }
    });
  }

  function getTokens() {
    return new Action(cb => cb(tokenModel.getAll()));
  }

  function getToken(tokenId) {
    return new Action(cb => cb(tokenModel.get(tokenId)));
  }

  function updateToken(tokenId, json) {
    return new Action(cb => cb(tokenModel.update(tokenId, json)));
  }

  function deleteToken(tokenId) {
    return new Action(cb => cb(tokenModel.remove(tokenId)));
  }

  return {
    createToken,
    getTokens,
    getToken,
    updateToken,
    deleteToken,
  };
}

module.exports = makeTokenProcessor;
