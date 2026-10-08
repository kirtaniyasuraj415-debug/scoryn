import { z } from 'zod';

const urlSchema = z.string().trim().url().max(2048);

function isPrivateIpv4(host: string) {
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a,b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 0) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19));
}

function isPrivateIpv6(host: string) {
  const value = host.toLowerCase();
  return value === '::1' || value === '::' || value.startsWith('fc') || value.startsWith('fd') || /^fe[89ab]/.test(value) || value.startsWith('::ffff:127.') || value.startsWith('::ffff:10.') || value.startsWith('::ffff:192.168.');
}

export function normalizeAuditUrl(input: string) {
  const parsed = urlSchema.parse(input.startsWith('http://') || input.startsWith('https://') ? input : 'https://' + input);
  const url = new URL(parsed);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http/https URLs are allowed.');
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.home.arpa') || isPrivateIpv4(host) || isPrivateIpv6(host)) throw new Error('Private/local network URLs are not allowed.');
  if (/^(0x|0o|0b)/i.test(host) || /^\d+$/.test(host)) throw new Error('IP-literal URLs are not allowed.');
  url.hash = '';
  return url.toString();
}
