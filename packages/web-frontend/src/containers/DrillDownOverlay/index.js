/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from 'material-ui/CircularProgress';
import BackIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

import { TRANS_BLACK, DIALOG_Z_INDEX, WHITE } from '../../styles';
import { VIEW_CONTENT_SHAPE } from '../../components/View';
import { EnlargedDialogContent } from '../EnlargedDialog/EnlargedDialogContent';

export const DrillDownOverlayComponent = ({
  viewContent,
  isLoading,
  errorMessage,
  onCloseOverlay,
  onDrillDown,
  onSetDateRange,
}) => {
  const content = isLoading ? (
    <CircularProgress style={styles.progressIndicator} />
  ) : (
    <EnlargedDialogContent
      onCloseOverlay={onCloseOverlay}
      CloseIcon={BackIcon}
      isDrilledDown
      viewContent={viewContent}
      onDrillDown={onDrillDown}
      onSetDateRange={onSetDateRange}
    />
  );

  return (
    <div style={styles.wrapper}>
      {errorMessage ? <p style={styles.error}>{errorMessage}</p> : null}
      {content}
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: TRANS_BLACK,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto',
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    zIndex: DIALOG_Z_INDEX + 1, // above export buttons.
  },
  titleBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 30,
  },
  backButton: {
    cursor: 'pointer',
  },
  title: {
    margin: 0,
    color: WHITE,
  },
  error: {
    color: 'red',
  },
  progressIndicator: {
    alignSelf: 'center',
    marginTop: 50,
  },
};

DrillDownOverlayComponent.propTypes = {
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  onCloseOverlay: PropTypes.func.isRequired,
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
  onDrillDown: PropTypes.func.isRequired,
  onSetDateRange: PropTypes.func.isRequired,
};

DrillDownOverlayComponent.defaultProps = {
  errorMessage: '',
  viewContent: null,
};
