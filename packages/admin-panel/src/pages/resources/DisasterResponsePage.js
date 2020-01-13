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
  editable: false,
};

const name = {
  Header: 'Name',
  source: 'name',
  editable: false,
};

const countryCode = {
  Header: 'Country',
  source: 'country.name',
  editable: false,
};

const point = {
  Header: 'Point',
  source: 'entity.point',
  editable: false,
};

const bounds = {
  Header: 'Bounds',
  source: 'entity.bounds',
  editable: false,
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
