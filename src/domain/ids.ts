/**
 * Domain ID Generator Utilities
 */

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateRoomId(name: string): string {
  const slug = slugify(name) || 'room';
  const shortId = Math.random().toString(36).substring(2, 6);
  return `${slug}-${shortId}`;
}

export function generateDeviceId(prefix: 'FAN' | 'GW' | 'SIREN' | 'AC', roomSlug?: string): string {
  const short = Math.random().toString(36).substring(2, 6).toUpperCase();
  if (roomSlug) {
    const cleanRoom = roomSlug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    return `SA-${prefix}-${cleanRoom}-${short}`;
  }
  return `SA-${prefix}-${short}`;
}

export function generateGatewayId(name?: string): string {
  const slug = name ? slugify(name).slice(0, 8) : 'gw';
  const short = Math.random().toString(36).substring(2, 6);
  return `gw-${slug}-${short}`;
}

export function generateEventId(): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `EVT-${time}-${rand}`.toUpperCase();
}

export function generatePacketId(): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `PKT-${time}-${rand}`.toUpperCase();
}
