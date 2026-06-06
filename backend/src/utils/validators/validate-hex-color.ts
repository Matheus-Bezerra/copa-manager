export function validateHexColor(value: string) {
  return /^#?[0-9A-Fa-f]{6}$/.test(value);
}
