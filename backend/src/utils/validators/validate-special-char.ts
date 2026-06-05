export function validateSpecialChar(value: string) {
  return /[^A-Za-z0-9]/.test(value);
}
