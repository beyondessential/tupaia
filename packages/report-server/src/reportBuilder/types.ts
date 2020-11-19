export type FieldValue = string | number | boolean | undefined;

export interface Row {
  [field: string]: FieldValue;
}
