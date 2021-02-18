/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

export const ExampleComponent = ({ title }) => <Typography variant="h1">{title}</Typography>;

ExampleComponent.propTypes = {
  title: PropTypes.string.isRequired,
};
