/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DatePicker, TextField, NumberField, BooleanField } from './preview/filters';

export const typeOptions = [
  { label: 'Text', value: 'text', FilterComponent: TextField },
  { label: 'Date', value: 'date', FilterComponent: DatePicker },
  { label: 'Boolean', value: 'boolean', FilterComponent: BooleanField },
  { label: 'Number', value: 'number', FilterComponent: NumberField },
];
