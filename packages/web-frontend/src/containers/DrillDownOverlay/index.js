/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import BackIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

import { TRANS_BLACK, DIALOG_Z_INDEX, WHITE } from '../../styles';
import {
  attemptDrillDown,
  closeDrillDown,
  goToDrillDownLevel,
  setDrillDownDateRange,
} from '../../actions';
import { VIEW_CONTENT_SHAPE } from '../../components/View';
import { EnlargedDialogContent } from '../EnlargedDialog';

class DrillDownOverlayComponent extends PureComponent {
  renderContent() {
    const { viewContent, onDrillDown, onBack, onSetDateRange, ...restOfProps } = this.props;
    return (
      <EnlargedDialogContent
        onCloseOverlay={onBack}
        CloseIcon={BackIcon}
        toolbarStyle={styles.leftCornerToolbar}
        isDrilledDown
        viewContent={viewContent}
        onDrillDown={onDrillDown}
        isVisible
        onSetDateRange={onSetDateRange}
        {...restOfProps}
      />
    );
  }

  render() {
    const { isLoading, errorMessage } = this.props;

    let content;

    if (isLoading) {
      content = <CircularProgress style={styles.progressIndicator} />;
    } else {
      content = this.renderContent();
    }

    return (
      <div style={styles.wrapper}>
        {errorMessage ? <p style={styles.error}>{errorMessage}</p> : null}
        {content}
      </div>
    );
  }
}

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
  leftCornerToolbar: {
    left: 5,
    right: undefined,
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
  onBack: PropTypes.func.isRequired,
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
  onDrillDown: PropTypes.func.isRequired,
  onSetDateRange: PropTypes.func.isRequired,
};

DrillDownOverlayComponent.defaultProps = {
  errorMessage: '',
  viewContent: null,
};

const mapStateToProps = ({ drillDown, enlargedDialog }) => ({
  viewContent:
    drillDown.levelContents[drillDown.currentLevel] &&
    drillDown.levelContents[drillDown.currentLevel].viewContent,
  currentLevel: drillDown.currentLevel,
  isLoading: drillDown.isLoading,
  enlargedDialog,
});

const mergeProps = (stateProps, { dispatch }, ownProps) => {
  return {
    ...stateProps,
    ...ownProps,
    onSetDateRange: (startDate, endDate) => {
      const { currentLevel } = stateProps;
      dispatch(setDrillDownDateRange(startDate, endDate, currentLevel));
    },
    onDrillDown: chartItem => {
      const { viewContent, currentLevel, enlargedDialog } = stateProps;
      const { drillDown } = viewContent;
      if (!drillDown) {
        return;
      }
      const { infoViewKey } = enlargedDialog;
      const { parameterLink, keyLink } = drillDown;

      const newDrillDownLevel = currentLevel + 1;
      const drillDownConfigKey = `${infoViewKey}_${newDrillDownLevel}`;

      dispatch(
        attemptDrillDown({
          viewContent: {
            infoViewKey: drillDownConfigKey,
            ...viewContent,
          },
          parameterLink,
          parameterValue: chartItem[keyLink],
          drillDownLevel: newDrillDownLevel,
        }),
      );
    },
    onBack: () => {
      const { currentLevel } = stateProps;
      if (currentLevel > 1) {
        const drillDownTo = currentLevel - 1;
        dispatch(goToDrillDownLevel(drillDownTo));
      } else {
        dispatch(closeDrillDown());
      }
    },
  };
};

export const DrillDownOverlay = connect(
  mapStateToProps,
  null,
  mergeProps,
)(DrillDownOverlayComponent);
