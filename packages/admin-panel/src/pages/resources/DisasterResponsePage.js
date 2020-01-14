/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
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
};

const bounds = {
  Header: 'Bounds',
  source: 'bounds',
  filterable: false,
};

export const NATURAL_DISASTER_COLUMNS = [id, type, description, name, countryCode, point, bounds];

const COLUMNS = [...NATURAL_DISASTER_COLUMNS];

export const DisasterResponsePage = () => (
  <ResourcePage
    title="Natural Disasters"
    endpoint="disaster"
    columns={COLUMNS}
    // importConfig={IMPORT_CONFIG}
  />
);
