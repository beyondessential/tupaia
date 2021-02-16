/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import { DARK_BLUE, WHITE } from '../styles';
import { SourceTooltip } from './SourceTooltip';

const renderSourceTooltip = source => {
  return <SourceTooltip source={source} />;
};

export const DialogTitleWrapper = props => {
  const { titleText, periodGranularity, isExporting, renderPeriodSelector, source } = props;
  const styles = {
    titleText: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'inherit',
      marginTop: '18px',
      marginBottom: '10px',
      gap: '3px',
    },
    dialogTitle: {
      textAlign: 'center',
      color: isExporting ? DARK_BLUE : WHITE,
    },
  };

  return (
    <DialogTitle style={styles.dialogTitle}>
      <span style={styles.titleText}>
        {titleText}
        {source && renderSourceTooltip(source)}
      </span>
      {periodGranularity && renderPeriodSelector()}
    </DialogTitle>
  );
};

DialogTitleWrapper.propTypes = {
  titleText: PropTypes.string,
  periodGranularity: PropTypes.string,
  isExporting: PropTypes.bool,
  source: PropTypes.object,
  renderPeriodSelector: PropTypes.func,
};
DialogTitleWrapper.defaultProps = {
  titleText: '',
  periodGranularity: null,
  isExporting: false,
  source: null,
  renderPeriodSelector: () => {},
};
