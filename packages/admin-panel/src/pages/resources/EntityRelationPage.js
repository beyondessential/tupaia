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
      sourceKey: 'parent_entity',
    },
  },
  {
    Header: 'Child',
    source: 'child_entity.name',
    editConfig: {
      optionsEndpoint: 'entityRelations',
    },
  },
  {
    Header: 'Entity Hierarchy',
    source: 'entity_hierarchy.name',
    editConfig: {
      optionsEndpoint: 'entityRelations',
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
  actionConfig: COLUMNS,
};

// When creating, return an array of records for bulk editing on the server
// When editing, just process a single record as normal
const processDataForSave = (fieldsToSave, recordData) => {
  const isEditingSingle = Object.keys(recordData).length > 0;
  if (isEditingSingle) {
    return fieldsToSave;
  }

  // Creating new records in bulk
  const records = [];

  const getRecordValues = (partialRecord, values) => {
    const [firstKey] = Object.keys(values);
    const { [firstKey]: ids, ...remainingRows } = values;

    ids.forEach(id => {
      const record = {
        ...partialRecord,
        [firstKey]: id,
      };

      if (Object.entries(remainingRows).length > 0) {
        getRecordValues(record, remainingRows);
      } else {
        records.push(record);
      }
    });
  };

  getRecordValues({}, fieldsToSave);

  return records;
};

export const EntityRelationPage = ({ getHeaderEl, ...props }) => (
  <ResourcePage
    title="Entity Relations"
    endpoint={ENDPOINT}
    columns={FIELDS}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
    {...props}
    onProcessDataForSave={processDataForSave}
  />
);

EntityRelationPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
