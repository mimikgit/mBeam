import { generateUUID } from '../helper/uuid';

const Action = require('action-js');

function createItem(mimikContext, body) {
  return new Action((cb) => {
    let item;
    try {
      const model = JSON.parse(body);
      if (
        model.name &&
        model.mimeType &&
        model.url &&
        model.nodeId &&
        model.thumbnailContentHint &&
        model.thumbnailContentHint.image &&
        model.thumbnailContentHint.mimeType
      ) {
        item = ({
          id: generateUUID(),
          name: model.name,
          mimeType: model.mimeType,
          url: model.url,
          nodeId: model.nodeId,
          thumbnailContentHint: {
            image: model.thumbnailContentHint.image,
            mimeType: model.thumbnailContentHint.mimeType,
          },
        });
      }
    } catch (e) {
      cb(e);
    }

    if (!item) {
      cb(new Error('invalid item'));
    } else {
      item.createTime = new Date(Date.now()).toISOString();
      cb(item);
    }
  })
    .next((item) => {
      mimikContext.storage.setItem(item.id, JSON.stringify(item));
      return item;
    })
    .next((item) => {
      mimikContext.dispatchWebSocketEvent();
      return item;
    });
}

function getItemList(mimikContext) {
  return new Action((cb) => {
    const list = [];
    mimikContext.storage.eachItem((key, value) => {
      const item = JSON.parse(value);
      list.push(item);
    });

    return cb(list);
  });
}

function getItem(mimikContext, itemId) {
  return new Action((cb) => {
    const item = mimikContext.storage.getItem(itemId);
    if (!item) {
      return cb(new Error(`no such item: ${itemId}`));
    }
    return cb(JSON.parse(item));
  });
}

function deleteItem(mimikContext, itemId) {
  return getItem(mimikContext, itemId)
    .next((item) => {
      mimikContext.storage.removeItem(itemId);
      return item;
    });
}

module.exports = {
  createItem,
  getItemList,
  getItem,
  deleteItem,
};
