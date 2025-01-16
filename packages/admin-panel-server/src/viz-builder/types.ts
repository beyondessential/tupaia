import { Report as BaseReportType, StandardReportConfig } from '@tupaia/types';

export type VizData = {
  transform: StandardReportConfig['transform'];
};

export enum PreviewMode {
  DATA = 'data',
  PRESENTATION = 'presentation',
}

export type Report = {
  code: string;
  permissionGroup: string;
  config: BaseReportType['config'];
  latestDataParameters: BaseReportType['latest_data_parameters'];
};

export type LegacyReport = {
  code: string;
  dataBuilder: string;
  config: Record<string, unknown>;
  dataServices: { isDataRegional: boolean }[];
};

export type ReportRecord = CamelKeysToSnake<Report> & { id: string };

type CamelToSnake<T extends string> = T extends `${infer Char}${infer Rest}`
  ? `${Char extends Uppercase<Char> ? '_' : ''}${Lowercase<Char>}${CamelToSnake<Rest>}`
  : '';

export type CamelKeysToSnake<T extends Record<string, unknown>> = {
  [K in keyof T as CamelToSnake<Extract<K, string>>]: T[K];
};

// expands object types recursively
// TODO: Move this type to a generic @tupaia/utils-ts package
export type ExpandType<T> = T extends Record<string, unknown>
  ? T extends infer O
    ? {
        [K in keyof O]: ExpandType<O[K]>;
      }
    : never
  : T;
