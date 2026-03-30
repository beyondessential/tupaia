export const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/;

export function isObjectId(value: string): boolean {
  return OBJECT_ID_PATTERN.test(value);
}
