const Action = require('action-js');
const makeTokenModel = require('../models/token');
const uuid = require('../lib/uuid');
const jwt = require('../lib/jwt');

function makeTokenProcessor(context) {
  const { signatureKey } = context.env;
  const tokenModel = makeTokenModel(context);

  function createToken(json) {
    return new Action((cb) => {
      const {
        url, mimeType, name, thumbnailContentHint, toNodeId, expIn,
      } = json;
      const exp = Math.round(new Date(new Date().getTime() + (expIn * 1000)).getTime() / 1000);
      if (!signatureKey) {
        throw new Error('edge container is missing "signatureKey"');
      }
      try {
        let tokenEntity = mimeType.includes('catalogue') ? tokenModel.findCatalogue(url, exp) : null;
        if (!tokenEntity) {
          const id = uuid.generate();
          const token = jwt.encode({
            jti: id,
            b: mimeType,
            c: url,
            exp,
          }, signatureKey);
          tokenEntity = tokenModel.insert({
            id,
            token,
            name,
            thumbnailContentHint,
            mimeType,
            toNodeId,
            expires: exp,
            url,
            playQueueUrl: `/files?id=${token}`,
            status: 'active',
            viewCount: 0,
            lastViewedAt: 0,
          });
        }
        cb(tokenEntity);
      } catch (err) {
        cb(err);
      }
    });
  }

  function getTokens() {
    return new Action(cb => cb(
      tokenModel
        .findAll()
        .filter(item => !item.mimeType.includes('catalogue')),
    ));
  }

  function getToken(tokenId) {
    return new Action(cb => cb(tokenModel.findById(tokenId)));
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
