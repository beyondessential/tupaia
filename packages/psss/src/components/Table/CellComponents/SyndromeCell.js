/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Tooltip } from '@tupaia/ui-components';

const DottedUnderline = styled.div`
  display: inline-block;
  border-bottom: 1px dotted ${props => props.theme.palette.text.secondary};
`;

export const SyndromeCell = ({ syndrome, syndromeDisplayName }) => (
  <Tooltip title={syndromeDisplayName}>
    <DottedUnderline>{syndrome}</DottedUnderline>
  </Tooltip>
);

SyndromeCell.propTypes = {
  syndrome: PropTypes.string.isRequired,
  syndromeDisplayName: PropTypes.string.isRequired,
};
