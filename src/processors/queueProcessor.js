const Action = require('action-js');
const { NotFoundError } = require('@mimik/edge-ms-helper/error-helper');
const makeQueueModel = require('../models/queue');

function makeQueueProcessor(context) {
  const queueModel = makeQueueModel(context);

  function createItem(item, useDeletableTime) {
    return new Action((cb) => {
      cb(queueModel.insert(item, useDeletableTime));
    })
      .next((createdItem) => {
        context.dispatchWebSocketEvent();
        return createdItem;
      });
  }

  function getItemList() {
    return new Action(cb => cb(queueModel.findAll()));
  }

  function getItem(itemId) {
    return new Action((cb) => {
      const item = queueModel.findById(itemId);
      if (!item) {
        return cb(new NotFoundError(`no such item: ${itemId}`));
      }
      return cb(JSON.parse(item));
    });
  }

  function deleteItem(itemId) {
    return getItem(itemId)
      .next((item) => {
        queueModel.remove(itemId);
        return item;
      });
  }

  function setReadStatus(itemId, queueUpdate) {
    return getItem(itemId)
      .next((item) => {
        const update = {
          ...item,
          readStatus: queueUpdate.readStatus,
        };
        return queueModel.update(update);
      });
  }

  return {
    createItem,
    getItemList,
    getItem,
    deleteItem,
    setReadStatus,
  };
}

module.exports = makeQueueProcessor;
