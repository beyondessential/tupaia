import { DatePicker } from './DatePicker';
import { TextField } from './TextField';
import { NumberField } from './NumberField';
import { BooleanField } from './BooleanField';
import { HierarchyField } from './HierarchyField';
import { OrganisationUnitCodesField } from './OrganisationUnitCodesField';
import { DataElementCodesField } from './DataElementCodesField';
import { DataGroupCodeField } from './DataGroupCodeField';
import { ArrayField } from './ArrayField';

export const FilterTypeOptions = [
  { label: 'Text', value: 'string', FilterComponent: TextField },
  { label: 'Date', value: 'date', FilterComponent: DatePicker },
  { label: 'Boolean', value: 'boolean', FilterComponent: BooleanField },
  { label: 'Number', value: 'number', FilterComponent: NumberField },
  { label: 'Hierarchy', value: 'hierarchy', FilterComponent: HierarchyField },
  {
    label: 'Organisation Unit Codes',
    value: 'organisationUnitCodes',
    FilterComponent: OrganisationUnitCodesField,
  },
  {
    label: 'Data Element Codes',
    value: 'dataElementCodes',
    FilterComponent: DataElementCodesField,
  },
  { label: 'Data Group Code', value: 'dataGroupCode', FilterComponent: DataGroupCodeField },
  { label: 'Array', value: 'array', FilterComponent: ArrayField },
];
