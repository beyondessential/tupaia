import { BaseViewConfig, ColorOption } from './common';

/**
 * @description this is keyed by value, e.g. { 'yes': { color: 'green' }, 'no': { color: 'red' } }
 */
type ColorPresentationOption = Record<string, ColorOption>;

export type MultiValuePresentationOptions = ColorPresentationOption & {
  isTitleVisible?: boolean;
  /**
   * @description This can be anything from the [numeraljs library]{@link http://numeraljs.com/#format}
   */
  valueFormat?: string;
};

export type MultiValueViewConfig = BaseViewConfig & {
  viewType: 'multiValue';
  presentationOptions?: MultiValuePresentationOptions;
};
