import { Flattable, Flattened } from '../../types';

export type HierarchyFields = Readonly<{
  id: string;
  code: string;
  name: string;
}>;

export type FlattableHierarchyFieldName = keyof Flattable<HierarchyFields>;
export type FlattenedHierarchy = Flattened<HierarchyFields>;

export type HierarchyResponseObject = Partial<HierarchyFields>;

export type HierarchyFieldName = keyof HierarchyFields;

export interface HierarchyContext {
  fields: HierarchyFieldName[];
  field?: FlattableHierarchyFieldName;
}
