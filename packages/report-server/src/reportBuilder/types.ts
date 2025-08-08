export type FieldValue = string | number | boolean | undefined | null;

export interface Row {
  [field: string]: FieldValue;
}
