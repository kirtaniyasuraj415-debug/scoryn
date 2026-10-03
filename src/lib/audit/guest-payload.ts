import { deflateRawSync, inflateRawSync } from 'node:zlib';

export function encodeGuestPayload(payload: unknown) {
  return Buffer.from(deflateRawSync(Buffer.from(JSON.stringify(payload)))).toString('base64url');
}

export function decodeGuestPayload<T>(id: string): T {
  const raw = Buffer.from(id, 'base64url');
  try {
    return JSON.parse(raw.toString('utf8')) as T;
  } catch {
    return JSON.parse(inflateRawSync(raw).toString('utf8')) as T;
  }
}
