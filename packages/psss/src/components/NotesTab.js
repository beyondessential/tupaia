/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { CardTabPanel } from '@tupaia/ui-components';
import { fetchStateShape } from '../hooks';

export const NotesTab = ({ state }) => {
  return <CardTabPanel>Notes Tab</CardTabPanel>;
};

NotesTab.propTypes = {
  state: PropTypes.shape(fetchStateShape).isRequired,
};
