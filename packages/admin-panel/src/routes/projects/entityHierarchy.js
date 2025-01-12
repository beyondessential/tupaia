import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

/* Exported for use in EntityHierarchiesPage */
export const RESOURCE_NAME = { singular: 'entity hierarchy', plural: 'entity hierarchies' };

const ENTITY_HIERARCHY_ENDPOINT = 'entityHierarchy';

const FIELDS = [
  {
    Header: 'Name',
    source: 'name',
    editable: false,
  },
  {
    Header: 'Canonical types',
    source: 'canonical_types',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'entityTypes',
      optionLabelKey: 'type',
      optionValueKey: 'type',
      pageSize: 1000, // entityTypes endpoint doesn't support filtering, so fetch all values
      allowMultipleValues: true,
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit entity hierarchy',
      editEndpoint: ENTITY_HIERARCHY_ENDPOINT,
      fields: FIELDS,
    },
  },
];

export const entityHierarchy = {
  resourceName: RESOURCE_NAME,
  endpoint: ENTITY_HIERARCHY_ENDPOINT,
  columns: COLUMNS,
  path: '/hierarchy',
};
