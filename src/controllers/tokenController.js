const response = require('edge-ms-helper/response-helper');
const makeTokenProcessor = require('../processors/tokenProcessor');
const { ParameterError } = require('../models/errors');

function createToken(req, res) {
  const { context, body, swagger } = req;
  const { ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
  } else if (!context.env.signatureKey) {
    response.sendHttpError(new Error('edge container is missing "signatureKey"'), res);
  } else {
    tokenProcessor.createToken(body)
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendHttpError(err, res))
      .go();
  }
}

function getTokens(req, res) {
  const { context, swagger } = req;
  const { ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
  } else {
    tokenProcessor.getTokens()
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendHttpError(err, res))
      .go();
  }
}

function getTokenById(req, res) {
  const { context, swagger } = req;
  const { id, ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
  } else {
    tokenProcessor.getToken(id)
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendHttpError(err, res))
      .go();
  }
}

function updateToken(req, res) {
  const { context, body, swagger } = req;
  const { id, ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);
  const jsonBody = JSON.parse(body);

  if (ownerCode !== context.env.ownerCode) {
    response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
  } else {
    tokenProcessor.updateToken(id, jsonBody)
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendHttpError(err, res))
      .go();
  }
}

function deleteToken(req, res) {
  const { context, swagger } = req;
  const { id, ownerCode } = swagger.params;
  const tokenProcessor = makeTokenProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
  } else {
    tokenProcessor.deleteToken(id)
      .next(data => response.sendResult({ data }, 200, res))
      .guard(err => response.sendHttpError(err, res))
      .go();
  }
}

module.exports = {
  createToken,
  getTokens,
  getTokenById,
  updateToken,
  deleteToken,
};
