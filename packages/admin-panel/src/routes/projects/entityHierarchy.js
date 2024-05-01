/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const ENTITY_HIERARCHY_ENDPOINT = 'entityHierarchy';

const FIELDS = [
  {
    Header: 'Name',
    source: 'name',
    editable: false,
  },
  {
    Header: 'Canonical Types',
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
      title: 'Edit Entity Hierarchy',
      editEndpoint: ENTITY_HIERARCHY_ENDPOINT,
      fields: FIELDS,
    },
  },
];

export const entityHierarchy = {
  title: 'Entity hierarchy',
  endpoint: ENTITY_HIERARCHY_ENDPOINT,
  columns: COLUMNS,
  url: '/hierarchy',
};
