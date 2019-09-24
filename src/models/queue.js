const uuid = require('../helpers/uuid');
const makeTokenModel = require('./token');

function makeQueueModel(context) {
  const { storage } = context;
  const TOKEN_PREFIX = makeTokenModel(context).PREFIX;

  function get(itemId) {
    return storage.getItem(itemId);
  }

  function getAll() {
    const list = [];
    storage.eachItem((key, value) => {
      if (!key.startsWith(TOKEN_PREFIX)) {
        const item = JSON.parse(value);
        list.push(item);
      }
    });
    return list;
  }

  function remove(itemId) {
    return storage.removeItem(itemId);
  }

  function insert(data, useDeletableTime) {
    const item = {
      id: uuid.generate(),
      name: data.name,
      mimeType: data.mimeType,
      url: data.url,
      nodeId: data.nodeId,
      thumbnailContentHint: {
        image: data.thumbnailContentHint.image,
        mimeType: data.thumbnailContentHint.mimeType,
      },
      createTime: new Date(Date.now()).toISOString(),
      readStatus: ((data.readStatus === 'read'
              || data.readStatus === 'unread')
              && data.readStatus)
              || 'unread',
      deletableTime: (useDeletableTime && data.deletableTime) || undefined,
    };
    storage.setItem(item.id, JSON.stringify(item));
    return item;
  }

  function update(data) {
    storage.setItem(data.id, JSON.stringify(data));
    return data;
  }

  return {
    get,
    getAll,
    remove,
    insert,
    update,
  };
}

module.exports = makeQueueModel;
