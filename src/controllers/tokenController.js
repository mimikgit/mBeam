const response = require('edge-ms-helper/response-helper');
const makeTokenProcessor = require('../processors/tokenProcessor');

function createToken(req, res) {
  const { context, body, swagger } = req;
  const { ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendError({ message: 'incorrect ownerCode' }, 403, res);
  } else if (!context.env.signatureKey) {
    response.sendError({ message: 'edge container is missing "signatureKey"' }, 403, res);
  } else {
    tokenProcessor.createToken(body)
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendError(err, 400, res))
      .go();
  }
}

function getTokens(req, res) {
  const { context, swagger } = req;
  const { ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendError({ message: 'incorrect ownerCode' }, 403, res);
  } else {
    tokenProcessor.getTokens()
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendError(err, 400, res))
      .go();
  }
}

function getToken(req, res) {
  const { context, swagger } = req;
  const { id, ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendError({ message: 'incorrect ownerCode' }, 403, res);
  } else {
    tokenProcessor.getToken(id)
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendError(err, 400, res))
      .go();
  }
}

function updateToken(req, res) {
  const { context, body, swagger } = req;
  const { id, ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);
  const jsonBody = JSON.parse(body);

  if (ownerCode !== context.env.ownerCode) {
    response.sendError({ message: 'incorrect ownerCode' }, 403, res);
  } else {
    tokenProcessor.updateToken(id, jsonBody)
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendError(err, 400, res))
      .go();
  }
}

function deleteToken(req, res) {
  const { context, swagger } = req;
  const { id, ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendError({ message: 'incorrect ownerCode' }, 403, res);
  } else {
    tokenProcessor.deleteToken(id)
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendError(err, 400, res))
      .go();
  }
}

module.exports = {
  createToken,
  getTokens,
  getToken,
  updateToken,
  deleteToken,
};
