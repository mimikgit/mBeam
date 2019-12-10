const sha256 = require('fast-sha256');
const base64 = require('./base64');

const jwt = module.exports;

const algorithmMap = {
  HS256: 'sha256',
};

const typeMap = {
  HS256: 'hmac',
};

function sign(input, key, method, type) {
  let base64str;
  if (type === 'hmac') {
    const k = new TextEncoder().encode(key);
    const i = new TextEncoder().encode(input);

    const h = new sha256.HMAC(k);
    const mac = h.update(i).digest();

    base64str = Duktape.enc('base64', mac);
  } else {
    throw new Error('Algorithm type not recognized');
  }

  return base64.urlEscape(base64str);
}

function verify(input, key, method, type, signature) {
  if (type === 'hmac') {
    return (signature === sign(input, key, method, type));
  }

  throw new Error('Algorithm type not recognized');
}

jwt.decode = (token, key, noVerify, algorithm) => {
  if (!token) {
    throw new Error('No token supplied');
  }

  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new Error('Not enough or too many segments');
  }

  const headerSeg = segments[0];
  const payloadSeg = segments[1];
  const signatureSeg = segments[2];

  const header = JSON.parse(base64.urlDecode(headerSeg));
  const payload = JSON.parse(base64.urlDecode(payloadSeg));

  if (!noVerify) {
    const signingMethod = algorithmMap[algorithm || header.alg];
    const signingType = typeMap[algorithm || header.alg];
    if (!signingMethod || !signingType) {
      throw new Error('Algorithm not supported');
    }

    const signingInput = [headerSeg, payloadSeg].join('.');
    if (!verify(signingInput, key, signingMethod, signingType, signatureSeg)) {
      throw new Error('Signature verification failed');
    }

    if (payload.nbf && Date.now() < payload.nbf * 1000) {
      throw new Error('Token not yet active');
    }

    if (payload.exp && Date.now() > payload.exp * 1000) {
      throw new Error('Token expired');
    }
  }

  return payload;
};

jwt.encode = (payload, key, alg) => {
  if (!key) {
    throw new Error('Require key');
  }

  const algorithm = alg || 'HS256';

  const signingMethod = algorithmMap[algorithm];
  const signingType = typeMap[algorithm];
  if (!signingMethod || !signingType) {
    throw new Error('Algorithm not supported');
  }

  const header = { typ: 'JWT', alg: algorithm };
  const segments = [];
  segments.push(base64.urlEncode(JSON.stringify(header)));
  segments.push(base64.urlEncode(JSON.stringify(payload)));
  segments.push(sign(segments.join('.'), key, signingMethod, signingType));

  return segments.join('.');
};
