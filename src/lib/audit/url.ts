import { z } from 'zod';

const urlSchema = z.string().trim().url().max(2048);

export function normalizeAuditUrl(input: string) {
  const parsed = urlSchema.parse(input.startsWith('http') ? input : `https://${input}`);
  const url = new URL(parsed);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http/https URLs are allowed.');
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) throw new Error('Private/local URLs are not allowed.');
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) throw new Error('Private network URLs are not allowed.');
  url.hash = '';
  return url.toString();
}
