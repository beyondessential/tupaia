/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import {
  attemptDrillDown,
  closeEnlargedDialog,
  openExportDialog,
  setEnlargedDashboardDateRange,
} from '../../actions';
import { DrillDownOverlay } from '../DrillDownOverlay';
import { EnlargedDialogContent } from './EnlargedDialogContent';
import { getIsMatrix, getIsDataDownload, VIEW_CONTENT_SHAPE } from '../../components/View';
import { isMobile } from '../../utils';
import { DIALOG_Z_INDEX } from '../../styles';
class EnlargedDialogComponent extends PureComponent {
  render() {
    const {
      isDrillDownVisible,
      onCloseOverlay,
      viewContent,
      onExport,
      organisationUnitName,
      onDrillDown,
      onSetDateRange,
      isLoading,
      isVisible,
    } = this.props;

    if (!isVisible) {
      return null;
    }

    const hasBigData =
      getIsMatrix(viewContent) || (viewContent && viewContent.data && viewContent.data.length) > 20;

    const getDialogStyle = () => {
      if (hasBigData) return styles.largeContainer;
      if (getIsDataDownload(viewContent)) return styles.smallContainer;
      return styles.container;
    };

    const drillDownOverlay = isDrillDownVisible ? (
      <DrillDownOverlay
        onSetDateRange={onSetDateRange}
        organisationUnitName={organisationUnitName}
      />
    ) : null;
    return (
      <Dialog
        open
        style={styles.dialog}
        onClose={onCloseOverlay}
        scroll={isMobile() ? 'body' : 'paper'}
        PaperProps={{ style: getDialogStyle() }}
      >
        <EnlargedDialogContent
          onCloseOverlay={onCloseOverlay}
          viewContent={viewContent}
          onExport={onExport}
          organisationUnitName={organisationUnitName}
          onDrillDown={onDrillDown}
          onSetDateRange={onSetDateRange}
          isLoading={isLoading}
          isVisible={isVisible}
          drillDownOverlay={drillDownOverlay}
        />
      </Dialog>
    );
  }
}

EnlargedDialogComponent.propTypes = {
  onCloseOverlay: PropTypes.func.isRequired,
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
  onExport: PropTypes.func.isRequired,
  organisationUnitName: PropTypes.string.isRequired,
  onDrillDown: PropTypes.func,
  onSetDateRange: PropTypes.func,
  isLoading: PropTypes.bool,
  isVisible: PropTypes.bool,
  isDrillDownVisible: PropTypes.bool,
};

EnlargedDialogComponent.defaultProps = {
  onDrillDown: () => {},
  onSetDateRange: () => {},
  isLoading: false,
  isVisible: false,
  isDrillDownVisible: false,
};

const styles = {
  container: {
    width: isMobile() ? '100%' : '75%',
    maxWidth: '768px',
    margin: 'auto',
  },
  largeContainer: {
    minWidth: '90%',
    maxWidth: 'auto',
  },
  smallContainer: {
    margin: 'auto',
  },
  dialog: {
    zIndex: DIALOG_Z_INDEX,
  },
};

const mapStateToProps = ({ drillDown, enlargedDialog }) => ({
  ...enlargedDialog,
  isDrillDownVisible: drillDown.isVisible,
});

const mapDispatchToProps = dispatch => ({
  onCloseOverlay: () => dispatch(closeEnlargedDialog()),
  onSetDateRange: (startDate, endDate) =>
    dispatch(setEnlargedDashboardDateRange(startDate, endDate)),
  dispatch,
});

const mergeProps = (stateProps, { dispatch, ...dispatchProps }, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
  onDrillDown: chartItem => {
    const { viewContent, infoViewKey } = stateProps;
    const { drillDown } = viewContent;
    if (!drillDown) {
      return;
    }
    const { parameterLink, keyLink } = drillDown;
    // Todo: add config for drillDown view here
    dispatch(
      attemptDrillDown(
        {
          infoViewKey,
          ...viewContent,
          defaultTimePeriod: null,
          periodGranularity: null,
        },
        parameterLink,
        chartItem[keyLink],
        1,
      ),
    );
  },
  onExport: extraConfig => {
    const { viewContent, organisationUnitName, startDate, endDate } = stateProps;
    const { viewId, organisationUnitCode, dashboardGroupId, chartType, exportConfig } = viewContent;

    const formats = getIsMatrix(viewContent) ? ['xlsx'] : ['png'];

    dispatch(
      openExportDialog({
        organisationUnitCode,
        organisationUnitName,
        viewId,
        dashboardGroupId,
        formats,
        startDate,
        endDate,
        chartType,
        extraConfig: { ...extraConfig, export: exportConfig },
      }),
    );
  },
});

export const EnlargedDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EnlargedDialogComponent);
