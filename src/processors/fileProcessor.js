import { base64urlDecode } from '../helper/base64';
import jwt from '../jwt';
import { generateUUID } from '../helper/uuid';

const Action = require('action-js');

function getFile(fileId) {
  return new Action((cb) => {
    try {
      const json = base64urlDecode(fileId);
      if (!json) {
        throw new Error('invalid file id');
      }
      const beamFile = JSON.parse(json);
      const mimeType = beamFile.b;
      const url = beamFile.c;
      cb({ url, mimeType });
    } catch (err) {
      cb(err);
    }
  });
}

function getFileWithSignature(fileId, signatureKey) {
  return new Action((cb) => {
    try {
      const beamFile = jwt.decode(fileId, signatureKey, false, 'HS256');
      const mimeType = beamFile.b;
      const url = beamFile.c;
      cb({ url, mimeType });
    } catch (err) {
      cb(err);
    }
  });
}

function createToken(json, signatureKey) {
  return new Action((cb) => {
    const tokenRequest = JSON.parse(json);
    const { url, mimeType, expIn } = tokenRequest;
    const exp = Math.round(new Date(new Date().getTime() + (expIn * 1000)).getTime() / 1000);
    if (!signatureKey) {
      throw new Error(`Signature key: ${signatureKey}`);
    }
    try {
      const token = jwt.encode({
        jti: generateUUID(),
        b: mimeType,
        c: url,
        exp,
      }, signatureKey);

      const data = {
        token,
        expires_in: exp,
        url: `/files?id=${token}`,
      };

      cb({ data });
    } catch (err) {
      cb(err);
    }
  });
}

module.exports = {
  getFile,
  getFileWithSignature,
  createToken,
};
