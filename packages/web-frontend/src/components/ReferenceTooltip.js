/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { Typography, Tooltip, withStyles, Link } from '@material-ui/core';
import PropTypes from 'prop-types';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import styled from 'styled-components';
import { BLUE } from '../styles';

const IconButton = styled(InfoRoundedIcon)`
  color: grey;
  transition: color 0.2s ease;
  &:hover {
    background-color: initial;
    color: white;
  }
`;
const styles = {
  defaultIconButton: { fontSize: '16px' },
  typography: { backgroundColor: 'black' },
};
const StyledToolTip = withStyles(theme => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
  },
}))(Tooltip);

export const ReferenceTooltip = props => {
  const { reference, iconStyle } = props;

  return (
    <StyledToolTip
      arrow
      interactive
      placement="top"
      title={
        <Typography variant="caption" style={styles.typography}>
          <span>Source: </span>
          <Link color={BLUE} href={reference.link} target="_blank" rel="noopener">
            {reference.name}
          </Link>
        </Typography>
      }
    >
      <IconButton style={iconStyle ? { ...iconStyle } : styles.defaultIconButton} />
    </StyledToolTip>
  );
};

ReferenceTooltip.propTypes = {
  reference: PropTypes.object,
  iconStyle: PropTypes.object,
};
ReferenceTooltip.defaultProps = {
  iconStyle: null,
  reference: null,
};
