export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface EmailValidationOptions {
  requiredMessage?: string;
  invalidMessage?: string;
  allowEmpty?: boolean;
}

export function validateEmailValue(
  rawValue: string | null | undefined,
  options: EmailValidationOptions = {}
): string {
  const {
    requiredMessage = 'Vui lòng nhập email.',
    invalidMessage = 'Email không đúng định dạng (ví dụ: admin@example.com).',
    allowEmpty = false,
  } = options;

  const trimmed = (rawValue ?? '').trim();

  if (!trimmed) {
    return allowEmpty ? '' : requiredMessage;
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return invalidMessage;
  }

  return '';
}