function makeTokenModel(context) {
  const { storage } = context;
  const PREFIX = '#token#';

  function insert(data) {
    storage.setItem(`${PREFIX}${data.id}`, JSON.stringify(data));
    return data;
  }

  function getAll() {
    const list = [];
    storage.eachItem((key, value) => {
      if (key.startsWith(PREFIX)) list.push(JSON.parse(value));
    });
    return list;
  }

  function get(id) {
    const item = storage.getItem(`${PREFIX}${id}`);
    if (!item) return new Error(`No item found with id: ${id}`);
    return JSON.parse(item);
  }

  function update(id, data) {
    const item = storage.getItem(`${PREFIX}${id}`);
    if (!item) return new Error(`No item found with id: ${id}`);

    const updatedItem = JSON.parse(item);
    updatedItem.status = data.status || updatedItem.status;
    storage.setItem(`${PREFIX}${id}`, JSON.stringify(updatedItem));
    return updatedItem;
  }

  function updateViewCount(id) {
    const item = storage.getItem(`${PREFIX}${id}`);
    if (!item) return new Error(`No item found with id: ${id}`);

    const updatedItem = JSON.parse(item);
    updatedItem.viewCount = updatedItem.viewCount || 0;
    updatedItem.viewCount += 1;
    storage.setItem(`${PREFIX}${id}`, JSON.stringify(updatedItem));
    return updatedItem;
  }

  function remove(id) {
    const item = storage.getItem(`${PREFIX}${id}`);
    if (!item) return new Error(`No item found with id: ${id}`);
    storage.removeItem(`${PREFIX}${id}`);
    return JSON.parse(item);
  }

  function isCancelled(id) {
    const item = storage.getItem(`${PREFIX}${id}`);
    if (item) {
      const { status } = JSON.parse(item);
      return status === 'cancelled';
    }
    return false;
  }

  return {
    PREFIX,
    insert,
    getAll,
    get,
    update,
    updateViewCount,
    remove,
    isCancelled,
  };
}

module.exports = makeTokenModel;
