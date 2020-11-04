/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import styled from 'styled-components';
import Dialog from '@material-ui/core/Dialog';

import { exportToPng, exportToExcel } from '../../utils/exports';
import {
  attemptDrillDown,
  closeEnlargedDialog,
  setEnlargedDashboardDateRange,
} from '../../actions';
import { DrillDownOverlay } from '../DrillDownOverlay';
import { EnlargedDialogContent } from './EnlargedDialogContent';
import { getIsMatrix, getIsDataDownload, VIEW_CONTENT_SHAPE } from '../../components/View';
import { isMobile, sleep, stringToFilename } from '../../utils';
import { DIALOG_Z_INDEX } from '../../styles';
import {
  selectCurrentInfoViewKey,
  selectCurrentExpandedViewContent,
  selectCurrentOrgUnit,
  selectCurrentProjectCode,
} from '../../selectors';
import { GRANULARITY_CONFIG } from '../../utils/periodGranularities';
import { ExportDialog } from '../../components/ExportDialog';

const Loader = styled.div`
  display: block;
  position: absolute;
  top: 0;
  height: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 1);
  color: white;
  z-index: 100;
  padding-top: 45px;
  text-align: center;
  font-size: 18px;
`;

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const EnlargedDialogComponent = ({
  isDrillDownVisible,
  onCloseOverlay,
  viewContent,
  errorMessage,
  organisationUnitName,
  onDrillDown,
  onSetDateRange,
  isLoading,
  isVisible,
  startDate,
  endDate,
  projectCode,
}) => {
  const exportRef = React.useRef(null);
  const [exportDialogIsOpen, setExportDialogIsOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportStatus, setExportStatus] = React.useState(STATUS.IDLE);

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

  const onExport = async format => {
    setExportStatus(STATUS.LOADING);
    setIsExporting(true);

    const filename = stringToFilename(`export-${organisationUnitName}-${viewContent.name}`);

    try {
      if (format === 'xlsx') {
        await exportToExcel({
          projectCode,
          viewContent,
          organisationUnitName,
          startDate,
          endDate,
          filename,
        });
      } else {
        const node = exportRef.current;
        await exportToPng(node, filename);
      }

      setIsExporting(false);
      await sleep(1000); // allow some time for the chart transition to finish before hiding the loader
      setExportStatus(STATUS.SUCCESS);
    } catch (e) {
      setIsExporting(false);
      setExportStatus(STATUS.ERROR);
    }
  };

  const handleOpenExportDialog = () => {
    setExportStatus(STATUS.IDLE);
    setExportDialogIsOpen(true);
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
        {exportStatus === STATUS.LOADING && <Loader>Exporting...</Loader>}
        <EnlargedDialogContent
          exportRef={exportRef}
          onCloseOverlay={onCloseOverlay}
          viewContent={viewContent}
          organisationUnitName={organisationUnitName}
          onDrillDown={onDrillDown}
          onOpenExportDialog={handleOpenExportDialog}
          onSetDateRange={onSetDateRange}
          isLoading={isLoading}
          isExporting={isExporting} // Todo: set exporting theme here?
          errorMessage={errorMessage}
          isVisible={isVisible}
          drillDownOverlay={drillDownOverlay}
        />
      </Dialog>
      <ExportDialog
        status={exportStatus}
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
  errorMessage: PropTypes.string,
  projectCode: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  isVisible: PropTypes.bool,
  isDrillDownVisible: PropTypes.bool,
};

EnlargedDialogComponent.defaultProps = {
  onDrillDown: () => {},
  onSetDateRange: () => {},
  errorMessage: null,
  startDate: null,
  endDate: null,
  projectCode: null,
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
  projectCode: selectCurrentProjectCode(state),
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
