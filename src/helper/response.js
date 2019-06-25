const JSON_INDEX = 2;

const toJson = (obj) => {
  if (Array.isArray(obj)) {
    return JSON.stringify({ data: obj }, null, JSON_INDEX);
  }

  return JSON.stringify(obj, null, JSON_INDEX);
};

function sendResult(result, code, res) {
  if (code !== 200) {
    res.statusCode = code;
  }

  res.end(toJson(result));
}

function sendError(err, code, res) {
  res.statusCode = code;
  res.end(toJson({
    message: err.message,
    code,
  }));
}

function writeMimeFile(url, mimeType, res) {
  res.writeMimeFile(url, mimeType);
}

module.exports = {
  sendResult,
  sendError,
  writeMimeFile,
};
