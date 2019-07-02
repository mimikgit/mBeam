
const makeQueueModel = require('../models/queue');

const Action = require('action-js');

function makeQueueProcessor(context) {
  const queueModel = makeQueueModel(context);

  function createItem(body) {
    return new Action((cb) => {
      const json = JSON.parse(body);
      cb(queueModel.insert(json));
    })
      .next((item) => {
        context.dispatchWebSocketEvent();
        return item;
      });
  }

  function getItemList() {
    return new Action(cb => cb(queueModel.getAll()));
  }

  function getItem(itemId) {
    return new Action((cb) => {
      const item = queueModel.get(itemId);
      if (!item) {
        return cb(new Error(`no such item: ${itemId}`));
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

  return {
    createItem,
    getItemList,
    getItem,
    deleteItem,
  };
}

module.exports = makeQueueProcessor;
