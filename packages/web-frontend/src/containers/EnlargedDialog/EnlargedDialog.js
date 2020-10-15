/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import download from 'downloadjs';
import domtoimage from '../../dom-to-image';

import {
  attemptDrillDown,
  closeEnlargedDialog,
  setEnlargedDashboardDateRange,
} from '../../actions';
import { DrillDownOverlay } from '../DrillDownOverlay';
import { EnlargedDialogContent } from './EnlargedDialogContent';
import { getIsMatrix, getIsDataDownload, VIEW_CONTENT_SHAPE } from '../../components/View';
import { isMobile } from '../../utils';
import { DIALOG_Z_INDEX } from '../../styles';
import {
  selectCurrentInfoViewKey,
  selectCurrentExpandedViewContent,
  selectCurrentOrgUnit,
} from '../../selectors';
import { GRANULARITY_CONFIG } from '../../utils/periodGranularities';
import { ExportDialog } from '../../components/ExportDialog';

const EnlargedDialogComponent = ({
  isDrillDownVisible,
  onCloseOverlay,
  viewContent,
  organisationUnitName,
  onDrillDown,
  onSetDateRange,
  isLoading,
  isVisible,
}) => {
  const exportRef = React.useRef(null);
  const [exportDialogIsOpen, setExportDialogIsOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  if (!isVisible) {
    return null;
  }

  const isMatrix = getIsMatrix(viewContent);
  const hasBigData = isMatrix || (viewContent && viewContent.data && viewContent.data.length) > 20;
  const exportFormats = isMatrix ? ['xlsx'] : ['png'];

  const getDialogStyle = () => {
    if (hasBigData) return styles.largeContainer;
    if (getIsDataDownload(viewContent)) return styles.smallContainer;
    return styles.container;
  };

  const onExport = () => {
    setIsExporting(true);
    const node = exportRef.current;

    domtoimage.toPng(node).then(dataUrl => {
      download(dataUrl, 'exported-chart.png');
      setIsExporting(false);
    });
  };

  const drillDownOverlay = isDrillDownVisible ? (
    <DrillDownOverlay organisationUnitName={organisationUnitName} />
  ) : null;

  return (
    <>
      <Dialog
        open
        style={styles.dialog}
        onClose={onCloseOverlay}
        scroll={isMobile() ? 'body' : 'paper'}
        PaperProps={{ style: getDialogStyle() }}
      >
        <EnlargedDialogContent
          exportRef={exportRef}
          onCloseOverlay={onCloseOverlay}
          viewContent={viewContent}
          organisationUnitName={organisationUnitName}
          onDrillDown={onDrillDown}
          onOpenExportDialog={() => setExportDialogIsOpen(true)}
          onSetDateRange={onSetDateRange}
          isLoading={isLoading}
          isExporting={isExporting} // Todo: set exporting theme here?
          isVisible={isVisible}
          drillDownOverlay={drillDownOverlay}
        />
      </Dialog>
      <ExportDialog
        isOpen={exportDialogIsOpen}
        onClose={() => setExportDialogIsOpen(false)}
        formats={exportFormats}
        onExport={onExport}
      />
    </>
  );
};

EnlargedDialogComponent.propTypes = {
  onCloseOverlay: PropTypes.func.isRequired,
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
  organisationUnitName: PropTypes.string.isRequired,
  onSetDateRange: PropTypes.func,
  onDrillDown: PropTypes.func,
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

const mapStateToProps = state => ({
  ...state.enlargedDialog,
  viewConfigs: state.global.viewConfigs,
  isDrillDownVisible: state.drillDown.isVisible,
  infoViewKey: selectCurrentInfoViewKey(state),
  viewContent: selectCurrentExpandedViewContent(state),
  organisationUnitName: selectCurrentOrgUnit(state).name,
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
    const { viewContent, infoViewKey, viewConfigs } = stateProps;
    // Get first layer config
    const {
      drillDown,
      drillDownLevel: currentDrillDownLevel,
      dashboardGroupId,
      organisationUnitCode,
      viewId,
      startDate,
    } = viewContent;

    if (!drillDown) {
      return;
    }

    const newDrillDownLevel = currentDrillDownLevel + 1;

    // Get second layer config
    // A special key signature is set up for drill down report configs
    // @see extractViewsFromAllDashboards in reducers.js
    const drillDownConfigKey = `${infoViewKey}_${newDrillDownLevel}`;
    const drillDownConfig = viewConfigs[drillDownConfigKey];
    const { parameterLink, keyLink } = drillDown;
    const { periodGranularity } = drillDownConfig;

    let defaultStartDate = null;
    let defaultEndDate = null;

    // If the second layer has periodGranularity set,
    // constrain the fetch by 1st layer date range
    if (periodGranularity) {
      defaultStartDate = startDate;

      // set the endDate to be end of the startDate period
      const { momentUnit } = GRANULARITY_CONFIG[periodGranularity];
      defaultEndDate = moment(startDate).clone().endOf(momentUnit);
    }

    dispatch(
      attemptDrillDown({
        viewContent: {
          dashboardGroupId,
          organisationUnitCode,
          ...drillDownConfig,
          infoViewKey: drillDownConfigKey,
          viewId,
        },
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        parameterLink,
        parameterValue: chartItem[keyLink],
        drillDownLevel: newDrillDownLevel,
      }),
    );
  },
});

export const EnlargedDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EnlargedDialogComponent);
