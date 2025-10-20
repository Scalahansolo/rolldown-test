import { isValidPhone } from './phone';

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function isValidContact(contact: string): boolean {
  return isValidEmail(contact) || isValidPhone(contact);
}
