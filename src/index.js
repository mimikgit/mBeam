import Router from 'router';
import Action from 'action-js';
import queryString from 'query-string';
import jwt from './jwt';
import { base64urlDecode } from './helper/base64';

class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code || 500;
  }
}

const app = Router({
  mergeParams: true,
});

function toJson(obj) {
  return JSON.stringify(obj, null, 2);
}

// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function generateUUID() {
  /* eslint-disable */
  var lut = []; for (var i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
  }

  var d0 = Math.random() * 0xffffffff | 0;
  var d1 = Math.random() * 0xffffffff | 0;
  var d2 = Math.random() * 0xffffffff | 0;
  var d3 = Math.random() * 0xffffffff | 0;
  return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
    lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
    lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
    lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
  /* eslint-enable */
}

function mapJsonToItem(json) {
  try {
    const model = JSON.parse(json);

    const valid =
      model.name &&
      model.mimeType &&
      model.url &&
      model.nodeId &&
      model.thumbnailContentHint &&
      model.thumbnailContentHint.image &&
      model.thumbnailContentHint.mimeType;

    if (!valid) {
      return null;
    }

    const item = ({
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

    return item;
  } catch (e) {
    console.log(`error catched:  ${e.message}`);
    return null;
  }
}

mimikModule.exports = (context, req, res) => {
  req.mimikContext = context;
  res.writeError = (apiError) => {
    res.statusCode = apiError.code;
    const json = JSON.stringify({
      code: apiError.code,
      message: apiError.message,
    });

    res.end(json);
  };

  app(req, res, (e) => {
    const err = (e && new ApiError(400, e.message)) ||
      new ApiError(404, 'not found');
    res.writeError(err);
  });
};

app.get('/play_queue', (req, res) => {
  const list = [];
  req.mimikContext.storage.eachItem((key, value) => {
    const item = JSON.parse(value);
    list.push(item);
  });

  const json = toJson({
    data: list,
  });

  res.end(json);
});

app.get('/play_queue/:itemId', (req, res) => {
  const { itemId } = req.params;
  const { storage } = req.mimikContext;

  const item = storage.getItem(itemId);
  if (!item) {
    res.writeError(new ApiError(400, `no such item: ${itemId}`));
    return;
  }

  res.end(item);
});

app.post('/token', (req, res) => {
  if (!req.body) {
    res.writeError(new ApiError(400, 'missing JSON body'));
    return;
  }

  new Action((cb) => {
    const { signatureKey } = req.mimikContext.env;
    const json = req.body;
    const tokenRequest = JSON.parse(json);
    const { url, mimeType, expIn } = tokenRequest;
    const exp = Math.round(new Date(new Date().getTime() + (expIn * 1000)).getTime() / 1000);
    const token = jwt.encode({
      jti: generateUUID(),
      b: mimeType,
      c: url,
      exp,
    }, signatureKey);

    const data = {
      token,
      url: `/files?id=${token}`,
    };

    cb(JSON.stringify({ data }));
  })
    .next((data) => {
      res.end(data);
    })
    .guard((e) => {
      // caught error
      res.writeError(new ApiError(400, e.message));
    })
    .go();
});

app.post('/play_queue', (req, res) => {
  if (!req.body) {
    res.writeError(new ApiError('missing JSON body'));
    return;
  }

  new Action((cb) => {
    const item = mapJsonToItem(req.body);
    if (!item) {
      cb(new Error('invalid item'));
    } else {
      item.createTime = new Date(Date.now()).toISOString();
      cb(item);
    }
  })
    .next((item) => {
      const json = JSON.stringify(item);
      req.mimikContext.storage.setItem(item.id, json);
      return item;
    })
    .next((item) => {
      req.mimikContext.dispatchWebSocketEvent();
      return item;
    })
    .next((item) => {
      const json = toJson(item);
      res.end(json);
    })
    .guard((e) => {
      // caught error
      res.writeError(new ApiError(400, e.message));
    })
    .go();
});

app.delete('/play_queue/:itemId', (req, res) => {
  const { itemId } = req.params;
  const { storage } = req.mimikContext;

  const item = storage.getItem(itemId);
  if (!item) {
    res.writeError(new ApiError(400, `no such item: ${itemId}`));
    return;
  }

  storage.removeItem(itemId);
  res.end(item);
});

app.get('/files', (req, res) => {
  const query = queryString.parse(req._parsedUrl.query);
  if (!(query && query.id)) {
    res.writeError(new ApiError(400, 'must provide query param id'));
    return;
  }

  const fileId = query.id;
  const ownerCode = query.ownerCode;

  // need to differentiate between virtualme access and mimik'd access
  try {
    if (ownerCode) {
      if (ownerCode !== req.mimikContext.env.ownerCode) {
        res.writeError(new ApiError(403, 'incorrect owner code'));
        return;
      }
      console.log(`files fileId: ${fileId}`);
      const json = base64urlDecode(fileId);
      console.log(`files json: ${json}`);
      const beamFile = JSON.parse(json);
      const mimeType = beamFile.b;
      const url = beamFile.c;

      res.writeMimeFile(url, mimeType);
    } else {
      const { signatureKey } = req.mimikContext.env;
      const beamFile = jwt.decode(fileId,
        signatureKey, false, 'HS256');

      const mimeType = beamFile.b;
      const url = beamFile.c;

      res.writeMimeFile(url, mimeType);
    }
  } catch (e) {
    res.writeError(new ApiError(403, e.message));
  }
});
