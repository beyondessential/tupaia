/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { prettyArray } from '../../utilities';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';

const ENTITY_HIERARCHY_ENDPOINT = 'entityHierarchy';
const TITLE = 'Entity Hierarchy';

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

export const EntityHierarchyPage = ({ getHeaderEl }) => (
  <ResourcePage
    title={TITLE}
    endpoint={ENTITY_HIERARCHY_ENDPOINT}
    columns={COLUMNS}
    getHeaderEl={getHeaderEl}
  />
);

EntityHierarchyPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
