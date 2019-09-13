const { init } = require('./edge-ms-helper/init-helper');
const swaggerMiddleware = require('../build/beam-swagger-mw');

mimikModule.exports = init(swaggerMiddleware);
