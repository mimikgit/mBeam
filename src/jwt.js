import sha256 from 'fast-sha256';

const jwt = module.exports;

const algorithmMap = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
  RS256: 'RSA-SHA256',
};

const typeMap = {
  HS256: 'hmac',
  HS384: 'hmac',
  HS512: 'hmac',
  RS256: 'sign',
};

const base64urlDecode = (base64) => {
  try {
    const diff = base64.length % 4;

    let data = base64
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    if (diff) {
      const padLength = 4 - diff;
      data += '='.repeat(padLength);
    }

    return new TextDecoder().decode(Duktape.dec('base64', data));
  } catch (e) {
    console.error(e.message);
    return '';
  }
};

const base64urlEscape = (base64) => {
  const e = base64.replace(/\+/g, '-')
    .replace(/\//g, '_').replace(/=/g, '');

  return e;
};

function sign(input, key, method, type) {
  let base64str;
  if (type === 'hmac') {
    const k = new TextEncoder().encode(key);
    const i = new TextEncoder().encode(input);

    const h = new sha256.HMAC(k); // also Hash and HMAC classes
    const mac = h.update(i).digest();

    base64str = Duktape.enc('base64', mac);
  } else {
    throw new Error('Algorithm type not recognized');
  }

  return base64urlEscape(base64str);
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
  // check segments
  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new Error('Not enough or too many segments');
  }

  // All segment should be base64
  const headerSeg = segments[0];
  const payloadSeg = segments[1];
  const signatureSeg = segments[2];

  // base64 decode and parse JSON
  const header = JSON.parse(base64urlDecode(headerSeg));
  const payload = JSON.parse(base64urlDecode(payloadSeg));

  if (!noVerify) {
    // if (!algorithm && /BEGIN( RSA)? PUBLIC KEY/.test(key.toString())) {
    //   algorithm = 'RS256';
    // }

    const signingMethod = algorithmMap[algorithm || header.alg];
    const signingType = typeMap[algorithm || header.alg];
    if (!signingMethod || !signingType) {
      throw new Error('Algorithm not supported');
    }

    // verify signature. `sign` will return base64 string.
    const signingInput = [headerSeg, payloadSeg].join('.');
    if (!verify(signingInput, key, signingMethod, signingType, signatureSeg)) {
      throw new Error('Signature verification failed');
    }

    // Support for nbf and exp claims.
    // According to the RFC, they should be in seconds.
    if (payload.nbf && Date.now() < payload.nbf * 1000) {
      throw new Error('Token not yet active');
    }

    if (payload.exp && Date.now() > payload.exp * 1000) {
      throw new Error('Token expired');
    }
  }

  return payload;
};
