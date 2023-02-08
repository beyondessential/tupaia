/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DatePicker } from './DatePicker';
import { TextField } from './TextField';
import { NumberField } from './NumberField';
import { BooleanField } from './BooleanField';

export const FilterTypeOptions = [
  { label: 'Text', value: 'text', FilterComponent: TextField },
  { label: 'Date', value: 'date', FilterComponent: DatePicker },
  { label: 'Boolean', value: 'boolean', FilterComponent: BooleanField },
  { label: 'Number', value: 'number', FilterComponent: NumberField },
];
