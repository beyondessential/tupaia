
export type MatrixColumnType = {
  key: string;
  title: string;
};

export type MatrixRowType = Record<string, any> & {
  title: string;
  children?: MatrixRowType[];
};
