const { init } = require('@mimik/edge-ms-helper/init-helper');
const swaggerMiddleware = require('../build/beam-swagger-mw');

mimikModule.exports = init(swaggerMiddleware);
