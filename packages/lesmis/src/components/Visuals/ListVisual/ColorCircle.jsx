import React from 'react';
import styled from 'styled-components';
import { lighten } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Tooltip } from '@tupaia/ui-components';

const CircleCell = styled.div`
  display: flex;
  justify-content: center;
  width: 115px;
  padding: 0;
  border-right: none;
`;

const CircleComponent = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 5px solid ${props => lighten(props.color, 0.6)};
`;

export const ColorCircle = ({ displayConfig }) => {
  // If there's no display config, return a grey circle to represent no data
  if (!displayConfig) {
    return (
      <CircleCell>
        <Tooltip title="No data">
          <CircleComponent color="#a1aaaf" />
        </Tooltip>
      </CircleCell>
    );
  }

  const { color, label } = displayConfig;

  return (
    <CircleCell>
      <Tooltip title={label}>
        <CircleComponent color={color} />
      </Tooltip>
    </CircleCell>
  );
};

ColorCircle.propTypes = {
  displayConfig: PropTypes.shape({
    color: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
};

ColorCircle.defaultProps = {
  displayConfig: null,
};
