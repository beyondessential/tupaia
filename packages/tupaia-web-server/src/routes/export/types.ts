export type QueryParams<T> = T & {
  respondWithEmailTimeout: number;
  emailExportFileMode?: string;
};
