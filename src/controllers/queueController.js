const response = require('edge-ms-helper/response-helper');
const makeQueueProcessor = require('../processors/queueProcessor');
const { ParameterError } = require('../models/errors');

function createItem(req, res) {
  const { context } = req;
  const { ownerCode, item } = req.swagger.params;
  const queueProcessor = makeQueueProcessor(req.context);

  queueProcessor.createItem(item, !!ownerCode && ownerCode === context.env.ownerCode)
    .next((createdItem => response.sendResult(createdItem, 200, res)))
    .guard(err => response.sendHttpError(err, res))
    .go();
}

function getItemList(req, res) {
  const { context } = req;
  const { ownerCode } = req.swagger.params;
  const queueProcessor = makeQueueProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
  } else {
    queueProcessor.getItemList()
      .next((data => response.sendResult({ data }, 200, res)))
      .guard(err => response.sendHttpError(err, res))
      .go();
  }
}

function getItem(req, res) {
  const { context } = req;
  const { ownerCode, id } = req.swagger.params;
  const queueProcessor = makeQueueProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
  } else {
    queueProcessor.getItem(id)
      .next((item => response.sendResult(item, 200, res)))
      .guard(err => response.sendHttpError(err, res))
      .go();
  }
}

function deleteItem(req, res) {
  const { context } = req;
  const { ownerCode, id } = req.swagger.params;
  const queueProcessor = makeQueueProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
  } else {
    queueProcessor.deleteItem(id)
      .next((item => response.sendResult(item, 200, res)))
      .guard(err => response.sendHttpError(err, res))
      .go();
  }
}

function setItemReadStatus(req, res) {
  const { context } = req;
  const { ownerCode, id, queueUpdate } = req.swagger.params;
  const queueProcessor = makeQueueProcessor(context);

  if (ownerCode !== context.env.ownerCode) {
    response.sendHttpError(new ParameterError('incorrect ownerCode'), res);
  } else {
    queueProcessor.setReadStatus(id, queueUpdate)
      .next((item => response.sendResult(item, 200, res)))
      .guard(err => response.sendHttpError(err, res))
      .go();
  }
}

module.exports = {
  createItem,
  getItemList,
  getItem,
  deleteItem,
  setItemReadStatus,
};
