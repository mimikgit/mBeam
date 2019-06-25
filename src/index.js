const { init } = require('./edge-ms-helper/init-helper');
const swaggerMiddleware = require('./middleware/mbeam-swagger-mw');

mimikModule.exports = init(swaggerMiddleware);
