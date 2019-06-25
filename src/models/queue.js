const uuid = require('../helpers/uuid');

function makeQueueModel(context) {
  const { storage } = context;

  function get(itemId) {
    return storage.getItem(itemId);
  }

  function getAll() {
    const list = [];
    storage.eachItem((key, value) => {
      const item = JSON.parse(value);
      list.push(item);
    });
    return list;
  }

  function remove(itemId) {
    return storage.removeItem(itemId);
  }

  function insert(data) {
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
    };
    storage.setItem(item.id, JSON.stringify(item));
    return item;
  }

  return {
    get,
    getAll,
    remove,
    insert,
  };
}

module.exports = makeQueueModel;
