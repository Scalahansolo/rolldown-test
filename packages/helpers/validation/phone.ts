import { isValidEmail } from './email';

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s-()]+$/.test(phone);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

export function validateContactType(contact: string): 'email' | 'phone' | 'unknown' {
  if (isValidEmail(contact)) return 'email';
  if (isValidPhone(contact)) return 'phone';
  return 'unknown';
}
