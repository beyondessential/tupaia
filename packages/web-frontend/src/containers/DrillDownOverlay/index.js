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
import { attemptDrillDown, closeDrillDown, goToDrillDownLevel } from '../../actions';
import { VIEW_CONTENT_SHAPE } from '../../components/View';
import { EnlargedDialogContent } from '../EnlargedDialog';
import { selectCurrentInfoViewKey } from '../../selectors';

class DrillDownOverlayComponent extends PureComponent {
  renderContent() {
    const { viewContent, onDrillDown, onBack, ...restOfProps } = this.props;
    return (
      <EnlargedDialogContent
        onCloseOverlay={onBack}
        CloseIcon={BackIcon}
        toolbarStyle={styles.leftCornerToolbar}
        isDrilledDown
        viewContent={viewContent}
        onDrillDown={onDrillDown}
        isVisible
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
};

DrillDownOverlayComponent.defaultProps = {
  errorMessage: '',
  viewContent: null,
};

const mapStateToProps = state => {
  const { drillDown } = state;
  const { currentLevel, isLoading, levelContents } = drillDown;

  return {
    viewContent: levelContents[currentLevel],
    currentLevel,
    isLoading,
    infoViewKey: selectCurrentInfoViewKey(state),
  };
};

const mergeProps = (stateProps, { dispatch }, ownProps) => {
  return {
    ...stateProps,
    ...ownProps,
    onDrillDown: chartItem => {
      const { viewContent, currentLevel, infoViewKey } = stateProps;
      const { drillDown } = viewContent;
      if (!drillDown) {
        return;
      }
      const { parameterLink, keyLink } = drillDown;
      dispatch(
        attemptDrillDown(
          {
            infoViewKey,
            ...viewContent,
          },
          parameterLink,
          chartItem[keyLink],
          currentLevel + 1,
        ),
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
