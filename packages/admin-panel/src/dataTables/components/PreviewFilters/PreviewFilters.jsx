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

export const PreviewFilters = ({ params, onChange, runtimeParams }) => {
  return (
    <FlexStart>
      {params.map(p => {
        const option = FilterTypeOptions.find(t => t.value === p?.config?.type);
        if (option) {
          const { FilterComponent } = option;
          return (
            <Grid key={p.id}>
              <FilterComponent
                {...p}
                value={runtimeParams[p.name]}
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
  params: ParametersType.isRequired,
  onChange: PropTypes.func.isRequired,
  runtimeParams: PropTypes.object.isRequired,
};
