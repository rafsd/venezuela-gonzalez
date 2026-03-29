import { PERSON_PALETTE } from '../constants';

export function personColor(name: string): string {
  if (!name) return PERSON_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const index = Math.abs(hash) % PERSON_PALETTE.length;
  return PERSON_PALETTE[index];
}

export function personInitials(name: string): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}
