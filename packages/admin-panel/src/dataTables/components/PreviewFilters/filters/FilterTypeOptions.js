/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DatePicker } from './DatePicker';
import { TextField } from './TextField';
import { NumberField } from './NumberField';
import { BooleanField } from './BooleanField';
import { HierarchyField } from './HierarchyField';

export const FilterTypeOptions = [
  { label: 'Text', value: 'string', FilterComponent: TextField },
  { label: 'Date', value: 'date', FilterComponent: DatePicker },
  { label: 'Boolean', value: 'boolean', FilterComponent: BooleanField },
  { label: 'Number', value: 'number', FilterComponent: NumberField },
  { label: 'Hierarchy', value: 'hierarchy', FilterComponent: HierarchyField },
];
