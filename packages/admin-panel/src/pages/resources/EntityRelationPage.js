/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

export const ENDPOINT = 'entityRelations';
export const COLUMNS = [
  {
    Header: 'Parent',
    source: 'parent_entity.name',
    editConfig: {
      optionsEndpoint: 'entityRelations',
      optionLabelKey: 'parent_entity.name',
      optionValueKey: 'parent_entity.id',
      sourceKey: 'parent_id',
    },
  },
  {
    Header: 'Child',
    source: 'child_entity.name',
    editConfig: {
      optionsEndpoint: 'entityRelations',
      optionLabelKey: 'child_entity.name',
      optionValueKey: 'child_entity.id',
      sourceKey: 'child_id',
    },
  },
  {
    Header: 'Entity Hierarchy',
    source: 'entity_hierarchy.name',
    editConfig: {
      optionsEndpoint: 'entityRelations',
      optionLabelKey: 'entity_hierarchy.name',
      optionValueKey: 'entity_hierarchy.id',
      sourceKey: 'entity_hierarchy_id',
    },
  },
];

const FIELDS = [
  ...COLUMNS,
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    actionConfig: {
      title: 'Edit Entity Relation',
      editEndpoint: ENDPOINT,
      fields: COLUMNS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  title: 'Create Entity Relation',
  actionConfig: { fields: COLUMNS, editEndpoint: ENDPOINT },
};

export const EntityRelationPage = ({ getHeaderEl, ...props }) => (
  <ResourcePage
    title="Entity Relations"
    endpoint={ENDPOINT}
    columns={FIELDS}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
    {...props}
  />
);

EntityRelationPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
