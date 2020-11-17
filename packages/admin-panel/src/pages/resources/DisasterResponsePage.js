/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const id = {
  Header: 'id',
  source: 'id',
  editable: false,
};

const type = {
  Header: 'Type',
  source: 'type',
  editable: false,
};

const description = {
  Header: 'Description',
  source: 'description',
  type: 'tooltip',
};

const name = {
  Header: 'Name',
  source: 'name',
};

const countryCode = {
  Header: 'Country',
  source: 'country',
};

const point = {
  Header: 'Point',
  source: 'point',
  filterable: false,
  type: 'tooltip',
};

const bounds = {
  Header: 'Bounds',
  source: 'bounds',
  filterable: false,
  type: 'tooltip',
};

const DISASTER_FIELDS = [id, type, description, name, countryCode, point, bounds];

const IMPORT_CONFIG = {
  title: 'Import Disasters',
  actionConfig: {
    importEndpoint: 'disaster',
  },
};

export const DisasterResponsePage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Disasters"
    endpoint="disasters"
    columns={DISASTER_FIELDS}
    importConfig={IMPORT_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

DisasterResponsePage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
