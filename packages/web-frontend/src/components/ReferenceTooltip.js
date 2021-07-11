/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import { Tooltip } from './Tooltip';
import { BLUE } from '../styles';

const DEFAULT = 'default';
const TILE_SET = 'tileSet';
const MAP_OVERLAY = 'mayOverlay';
export const TOOLTIP_ICON_STYLE_OPTIONS = {
  DEFAULT,
  TILE_SET,
  MAP_OVERLAY,
};

const IconButton = styled(InfoRoundedIcon)`
  font-size: 16px;
  color: grey;
  transition: color 0.2s ease;
  &:hover {
    background-color: initial;
    color: white;
  }
`;
const styles = {
  link: { color: BLUE },
  iconButton: {
    [DEFAULT]: { fontSize: '16px' },
    [TILE_SET]: { fontSize: '16px', marginBottom: '-1px' },
    [MAP_OVERLAY]: { fontSize: '20px', marginTop: '3px' },
  },
  typography: { backgroundColor: 'black' },
};

export const ReferenceTooltip = props => {
  const { reference, iconStyleOption } = props;

  return (
    <Tooltip
      arrow
      interactive
      placement="top"
      enterTouchDelay="50"
      title={
        <Typography variant="caption" style={styles.typography}>
          <span>Source: </span>
          <a style={styles.link} href={reference.link} target="_blank" rel="noopener noreferrer">
            {reference.name}
          </a>
        </Typography>
      }
    >
      <IconButton
        style={
          iconStyleOption && styles.iconButton[iconStyleOption]
            ? styles.iconButton[iconStyleOption]
            : styles.iconButton[DEFAULT]
        }
      />
    </Tooltip>
  );
};

ReferenceTooltip.propTypes = {
  reference: PropTypes.object,
  iconStyleOption: PropTypes.string,
};
ReferenceTooltip.defaultProps = {
  iconStyleOption: null,
  reference: null,
};
