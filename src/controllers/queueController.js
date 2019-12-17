const response = require('@mimik/edge-ms-helper/response-helper');
const makeQueueProcessor = require('../processors/queueProcessor');

function createItem(req, res) {
  const { context } = req;
  const { ownerCode, item } = req.swagger.params;
  const queueProcessor = makeQueueProcessor(req.context);

  const allowDelete = !!ownerCode && ownerCode === context.env.ownerCode;
  queueProcessor.createItem(item, allowDelete)
    .next((createdItem => response.sendResult(createdItem, 200, res)))
    .guard(err => response.sendError(err, res))
    .go();
}

function getItemList(req, res) {
  const { context } = req;
  const queueProcessor = makeQueueProcessor(context);

  queueProcessor.getItemList()
    .next((data => response.sendResult({ data }, 200, res)))
    .guard(err => response.sendError(err, res))
    .go();
}

function getItem(req, res) {
  const { context } = req;
  const { id } = req.swagger.params;
  const queueProcessor = makeQueueProcessor(context);

  queueProcessor.getItem(id)
    .next((item => response.sendResult(item, 200, res)))
    .guard(err => response.sendError(err, res))
    .go();
}

function deleteItem(req, res) {
  const { context } = req;
  const { id } = req.swagger.params;
  const queueProcessor = makeQueueProcessor(context);

  queueProcessor.deleteItem(id)
    .next((item => response.sendResult(item, 200, res)))
    .guard(err => response.sendError(err, res))
    .go();
}

function setItemReadStatus(req, res) {
  const { context } = req;
  const { id, queueUpdate } = req.swagger.params;
  const queueProcessor = makeQueueProcessor(context);

  queueProcessor.setReadStatus(id, queueUpdate)
    .next((item => response.sendResult(item, 200, res)))
    .guard(err => response.sendError(err, res))
    .go();
}

module.exports = {
  createItem,
  getItemList,
  getItem,
  deleteItem,
  setItemReadStatus,
};
