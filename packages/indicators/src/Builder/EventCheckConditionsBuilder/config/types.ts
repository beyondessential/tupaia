/**
 * Default Value for event data values
 * 'undefined' can be passed in to treat the value as "optional"
 */
export type DefaultValue = number | string | 'undefined';

/**
 * A flexible config schema that can be provided as an input to the indicator
 */
export type EventCheckConditionsConfig = {
  readonly formula: string;
  readonly programCode: string;
  readonly defaultValues?: Record<string, DefaultValue>;
};
