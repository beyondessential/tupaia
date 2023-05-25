export type Series = {
  key: string;
  name: string;
  hideFromPopup?: boolean;
  metadata: object;
  value: string | number;
  organisationUnit?: string;
  sortOrder: number;
};
