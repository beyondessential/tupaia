/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FlexStart as BaseFlexStart } from '@tupaia/ui-components';

import { ParametersType } from '../editing/types';
import { FilterTypeOptions } from './filters';

const Grid = styled.div`
  width: 200px;
  padding: 10px;
`;

const FlexStart = styled(BaseFlexStart)`
  flex-wrap: wrap;
`;

export const PreviewFilters = ({ parameters, onChange, haveTriedToFetch }) => {
  return (
    <FlexStart>
      {parameters.map(p => {
        const option = FilterTypeOptions.find(t => t.value === p?.config?.type);
        if (option) {
          const { FilterComponent } = option;
          return (
            <Grid key={p.id}>
              <FilterComponent
                {...p}
                haveTriedToFetch={haveTriedToFetch}
                onChange={newValue => {
                  onChange(p.name, newValue);
                }}
              />
            </Grid>
          );
        }
        return <div key={p.id} />;
      })}
    </FlexStart>
  );
};

PreviewFilters.propTypes = {
  parameters: ParametersType.isRequired,
  onChange: PropTypes.func.isRequired,
  haveTriedToFetch: PropTypes.bool,
};

PreviewFilters.defaultProps = { haveTriedToFetch: true };
