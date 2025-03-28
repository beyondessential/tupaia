export interface DataTableParameter {
  name: string;
  config: DataTableParameterConfig;
}

export interface DataTableParameterConfig {
  type: string;
  defaultValue?: unknown;
  innerType?: DataTableParameterConfig;
  oneOf?: unknown[];
  required?: boolean;
}
