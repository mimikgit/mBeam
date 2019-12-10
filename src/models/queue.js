const uuid = require('../lib/uuid');
const makeTokenModel = require('./token');

function makeQueueModel(context) {
  const { storage } = context;
  const TOKEN_PREFIX = makeTokenModel(context).PREFIX;

  function findById(itemId) {
    return storage.getItem(itemId);
  }

  function findByUrl(url) {
    let item = null;
    storage.eachItem((key, value) => {
      const json = JSON.parse(value);
      if (!key.startsWith(TOKEN_PREFIX) && json.url === url) item = json;
    });
    return item;
  }

  function findAll() {
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
    let item = data.mimeType.includes('catalogue') ? findByUrl(data.url) : null;
    if (!item) {
      item = {
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
    }
    return item;
  }

  function update(data) {
    storage.setItem(data.id, JSON.stringify(data));
    return data;
  }

  return {
    findById,
    findAll,
    remove,
    insert,
    update,
  };
}

module.exports = makeQueueModel;
