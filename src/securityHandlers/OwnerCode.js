function SecurityHandler(req, definition, apikey, next) {
  const { ownerCode } = req.context.env;
  if (apikey !== ownerCode) {
    next(new Error('incorrect ownerCode'));
    return;
  }

  next();
}

module.exports = SecurityHandler;
