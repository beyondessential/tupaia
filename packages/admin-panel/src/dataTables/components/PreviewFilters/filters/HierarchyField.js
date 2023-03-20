/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import PropTypes from 'prop-types';
import { Autocomplete } from '@tupaia/ui-components';

import { ParameterType } from '../../editing';
import { useProjects } from '../../../../VizBuilderApp/api';

export const HierarchyField = ({ name, value, onChange, config }) => {
  const { data: hierarchies = [], isLoading } = useProjects();

  return (
    <Autocomplete
      id="hierarchy-field"
      name={name}
      label={name}
      defaultValue={value}
      placeholder={config?.defaultValue}
      options={hierarchies.map(p => p['project.code'])}
      disabled={isLoading}
      onChange={(event, selectedValues) => onChange(selectedValues?.code)}
    />
  );
};

HierarchyField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

HierarchyField.defaultProps = {
  value: '',
};
