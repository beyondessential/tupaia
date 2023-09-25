/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { VariantType, SharedProps, OptionsObject as BaseOptionsObject } from 'notistack';

declare module 'notistack' {
  export interface OptionsObject<V extends VariantType = VariantType> extends BaseOptionsObject<V> {
    icon?: React.ReactNode;
  }
}
