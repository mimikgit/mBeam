import Router from 'router';
import swagger from './middleware/mbeam-swagger-mw';

class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code || 500;
  }
}

const app = Router({
  mergeParams: true,
});

app.use(swagger);

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
