const response = require('@mimik/edge-ms-helper/response-helper');
const makeTokenProcessor = require('../processors/tokenProcessor');

function createToken(req, res) {
  const { context, swagger } = req;
  const { tokenData } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  if (!context.env.signatureKey) {
    response.sendError(new Error('edge container is missing "signatureKey"'), res);
  } else {
    tokenProcessor.createToken(tokenData)
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendError(err, res))
      .go();
  }
}

function getTokens(req, res) {
  const { context } = req;
  const tokenProcessor = makeTokenProcessor(context);

  tokenProcessor.getTokens()
    .next(data => response.sendResult({ data }, 200, res))
    .guard(err => response.sendError(err, res))
    .go();
}

function getTokenById(req, res) {
  const { context, swagger } = req;
  const { id } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  tokenProcessor.getToken(id)
    .next(data => response.sendResult({ data }, 200, res))
    .guard(err => response.sendError(err, res))
    .go();
}

function updateToken(req, res) {
  const { context, swagger } = req;
  const { id, tokenData } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  tokenProcessor.updateToken(id, tokenData)
    .next(data => response.sendResult({ data }, 200, res))
    .guard(err => response.sendError(err, res))
    .go();
}

function deleteToken(req, res) {
  const { context, swagger } = req;
  const { id } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  tokenProcessor.deleteToken(id)
    .next(data => response.sendResult({ data }, 200, res))
    .guard(err => response.sendError(err, res))
    .go();
}

module.exports = {
  createToken,
  getTokens,
  getTokenById,
  updateToken,
  deleteToken,
};
