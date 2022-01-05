/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ReferenceTooltip } from '@tupaia/ui-components';
import { WHITE } from '../styles';

const renderReferenceTooltip = reference => {
  return <ReferenceTooltip reference={reference} />;
};

export const DialogTitleWrapper = props => {
  const {
    titleText,
    periodGranularity,
    color,
    renderPeriodSelector,
    reference,
    isExporting,
  } = props;
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
      paddingBottom: isExporting ? 30 : 0,
      color,
    },
  };

  return (
    <DialogTitle style={styles.dialogTitle}>
      <span style={styles.titleText}>
        {titleText}
        {reference && renderReferenceTooltip(reference)}
      </span>
      {periodGranularity && renderPeriodSelector()}
    </DialogTitle>
  );
};

DialogTitleWrapper.propTypes = {
  titleText: PropTypes.string,
  periodGranularity: PropTypes.string,
  color: PropTypes.string,
  reference: PropTypes.object,
  renderPeriodSelector: PropTypes.func,
};
DialogTitleWrapper.defaultProps = {
  titleText: '',
  periodGranularity: null,
  color: WHITE,
  reference: null,
  renderPeriodSelector: () => {},
};
