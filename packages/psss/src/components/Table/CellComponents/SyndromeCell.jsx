import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Tooltip } from '@tupaia/ui-components';

const DottedUnderline = styled.div`
  display: inline-block;
  border-bottom: 1px dotted ${props => props.theme.palette.text.secondary};
`;

export const SyndromeCell = ({ syndrome, syndromeName }) => (
  <Tooltip title={syndromeName}>
    <DottedUnderline>{syndrome}</DottedUnderline>
  </Tooltip>
);

SyndromeCell.propTypes = {
  syndrome: PropTypes.string.isRequired,
  syndromeName: PropTypes.string.isRequired,
};
