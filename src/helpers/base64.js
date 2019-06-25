function urlEscape(base64) {
  const e = base64.replace(/\+/g, '-')
    .replace(/\//g, '_').replace(/=/g, '');

  return e;
}

function urlEncode(string) {
  const b64 = Duktape.enc('base64', string);
  return urlEscape(b64);
}

function urlDecode(base64) {
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
}

module.exports = {
  urlEscape,
  urlEncode,
  urlDecode,
};
