const Router = require('router');
const queryString = require('query-string');
const parseUrl = require('parseurl');
const validate = require('jsonschema').validate;

const queueController = require('../controllers/queueController.js');
const fileController = require('../controllers/fileController.js');

const mw = Router();

const swaggerParams = params => (req, res, next) => {
  if (!req._query) {
    parseUrl(req);
    req._query = queryString.parse(req._parsedUrl.query) || {};
  }

  req.swagger = {};
  try {
    req.swagger.params = params.reduce((acc, p) => {
      const { in: inType, name, hasSchema, required, schema } = p;
      if (inType === 'body') {
        const body = req.body;
        try {
          if (hasSchema) {
            const instance = JSON.parse(body);
            validate(instance, schema, { throwError: true });
            acc[name] = instance;
          } else {
            acc[name] = body;
          }
        } catch (e) {
          const err = new Error(e.message);
          err.code = 400;
          throw err;
        }
      } else if (inType === 'path') {
        acc[name] = req.params[name];
      } else if (inType === 'query') {
        acc[name] = req._query[name];
      }

      if (required && !acc[name]) {
        const err = new Error(`${name} is required`);
        err.code = 400;
        throw err;
      }
      return acc;
    }, {});
  } catch (e) {
    return next(e);
  }

  return next();
};

/* eslint-disable */
const createItemParams = [
  {
    "in": "body",
    "name": "item",
    "required": true,
    "hasSchema": true,
    "schema": {
      "type": "object",
      "required": [
        "name",
        "mimeType",
        "url",
        "nodeId",
        "thumbnailContentHint"
      ],
      "properties": {
        "id": {
          "type": "string",
          "example": "001f7591-4102-4cd6-9ece-e21f03cc0d5f"
        },
        "name": {
          "type": "string",
          "example": "IMG_20171205_101453015.jpg"
        },
        "mimeType": {
          "type": "string",
          "example": "image/jpeg"
        },
        "url": {
          "type": "string",
          "example": "http://172.22.2.20:8083/beam/v1/files?id=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI1NmVjMTVjYy0wZmRjLTQ1MWUtOWVmZi1hZWRmODRiNzViZTQiLCJiIjoiaW1hZ2UvanBlZyIsImMiOiIvc3RvcmFnZS9lbXVsYXRlZC8wL0FuZHJvaWQvZGF0YS9jb20ubWltaWsuYWNjZXNzZGV2L2NhY2hlL21pbWlrX2NhY2hlL0wzTjBiM0poWjJVdlpXMTFiR0YwWldRdk1DOUVRMGxOTDFOamNtVmxibk5vYjNSekwxTmpjbVZsYm5Ob2IzUmZNakF4T1RBeU1EY3RNVEV6TXpNelgwTm9jbTl0WlM1cWNHYy5qcGciLCJleHAiOjE1NTI2ODk3MzR9.IxBuPtywhrVXG5A3C4w_VOZ_PiaRAdpbUoxypxcGc24"
        },
        "nodeId": {
          "type": "string",
          "example": "d9bd4359cd0ba52c"
        },
        "thumbnailContentHint": {
          "type": "object",
          "required": [
            "image",
            "mimeType"
          ],
          "properties": {
            "image": {
              "type": "string",
              "description": "The thumbnail data encoded with URL-safe Base64 (RFC 4648 section 5).\n"
            },
            "mimeType": {
              "type": "string",
              "description": "The MIME type of the thumbnail.\n"
            }
          }
        },
        "createTime": {
          "type": "string",
          "example": "2018-02-13T23:12:20.006Z"
        },
        "readStatus": {
          "type": "string",
          "enum": [
            "read",
            "unread"
          ],
          "example": "unread",
          "default": "unread"
        }
      }
    }
  }
];
/* eslint-enable */
mw.post('/play_queue', swaggerParams(createItemParams), queueController.createItem);

/* eslint-disable */
const getItemListParams = [
  {
    "in": "query",
    "name": "ownerCode",
    "required": true,
    "hasSchema": false
  }
];
/* eslint-enable */
mw.get('/play_queue', swaggerParams(getItemListParams), queueController.getItemList);

/* eslint-disable */
const getItemParams = [
  {
    "in": "path",
    "name": "id",
    "required": true,
    "hasSchema": false
  },
  {
    "in": "query",
    "name": "ownerCode",
    "required": true,
    "hasSchema": false
  }
];
/* eslint-enable */
mw.get('/play_queue/:id', swaggerParams(getItemParams), queueController.getItem);

/* eslint-disable */
const setItemReadStatusParams = [
  {
    "in": "path",
    "name": "id",
    "required": true,
    "hasSchema": false
  },
  {
    "in": "query",
    "name": "ownerCode",
    "required": true,
    "hasSchema": false
  },
  {
    "in": "body",
    "name": "queueUpdate",
    "required": true,
    "hasSchema": true,
    "schema": {
      "properties": {
        "readStatus": {
          "type": "string",
          "enum": [
            "read",
            "unread"
          ]
        }
      }
    }
  }
];
/* eslint-enable */
mw.put('/play_queue/:id', swaggerParams(setItemReadStatusParams), queueController.setItemReadStatus);

/* eslint-disable */
const deleteItemParams = [
  {
    "in": "path",
    "name": "id",
    "required": true,
    "hasSchema": false
  },
  {
    "in": "query",
    "name": "ownerCode",
    "required": true,
    "hasSchema": false
  }
];
/* eslint-enable */
mw.delete('/play_queue/:id', swaggerParams(deleteItemParams), queueController.deleteItem);

/* eslint-disable */
const getFileParams = [
  {
    "in": "query",
    "name": "id",
    "required": true,
    "hasSchema": false
  },
  {
    "in": "query",
    "name": "ownerCode",
    "required": false,
    "hasSchema": false
  }
];
/* eslint-enable */
mw.get('/files', swaggerParams(getFileParams), fileController.getFile);

/* eslint-disable */
const createTokenParams = [
  {
    "in": "query",
    "name": "ownerCode",
    "required": true,
    "hasSchema": false
  },
  {
    "in": "body",
    "name": "object",
    "required": true,
    "hasSchema": true,
    "schema": {
      "required": [
        "url",
        "mimeType",
        "expIn"
      ],
      "properties": {
        "url": {
          "type": "string",
          "description": "URL of the file\n",
          "example": "/path/to/file.jpg"
        },
        "mimeType": {
          "type": "string",
          "description": "MIME type of the file\n",
          "example": "image/jpeg"
        },
        "expIn": {
          "type": "integer",
          "description": "Number of seconds that file access will be valid for\n",
          "example": 3600
        }
      }
    }
  }
];
/* eslint-enable */
mw.post('/token', swaggerParams(createTokenParams), fileController.createToken);


/* eslint-disable */
mw.use((err, req, res, next) => {
  const { code, message } = err;
  res.statusCode = code || 500;
  const json = JSON.stringify({
    code,
    message,
  });

  res.end(json);
});
/* eslint-enable */

module.exports = mw;
