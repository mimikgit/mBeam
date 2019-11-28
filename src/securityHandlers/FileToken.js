const jwt = require('../helpers/jwt');

function SecurityHandler(req, definition, token, next) {
  const { signatureKey } = req.context.env;
  if (signatureKey) {
    next(new Error('edge container is missing "signatureKey"'));
    return;
  }

  try {
    jwt.decode(token, signatureKey, false, 'HS256');
    next();
  } catch (e) {
    next(new Error('invalid file ID'));
  }
}

module.exports = SecurityHandler;
