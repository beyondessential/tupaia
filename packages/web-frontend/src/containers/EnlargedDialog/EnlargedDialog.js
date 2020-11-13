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
  fetchEnlargedDialogData,
} from '../../actions';
import { DrillDownOverlay } from '../DrillDownOverlay';
import { EnlargedDialogContent } from './EnlargedDialogContent';
import { getIsMatrix, getIsDataDownload, VIEW_CONTENT_SHAPE } from '../../components/View';
import { getInfoFromInfoViewKey, isMobile, sleep, stringToFilename } from '../../utils';
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
  onCloseOverlay,
  contentByLevel,
  errorMessage,
  organisationUnitName,
  onDrillDown,
  onSetDateRange,
  startDate,
  endDate,
  projectCode,
  infoViewKey,
  fetchViewData,
}) => {
  const exportRef = React.useRef(null);
  const [exportDialogIsOpen, setExportDialogIsOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportStatus, setExportStatus] = React.useState(STATUS.IDLE);
  const [drillDownState, setDrillDownState] = React.useState({
    drillDownLevel: 0,
    parameterLink: null,
    parameterValue: null,
  });
  const { drillDownLevel } = drillDownState;

  const viewContent = contentByLevel[drillDownLevel] && contentByLevel[drillDownLevel].viewContent;

  const isLoading = false;

  const { organisationUnitCode, dashboardGroupId, viewId } = getInfoFromInfoViewKey(infoViewKey);

  React.useEffect(() => {
    if (!viewId) return;
    const options = {
      viewContent: {
        infoViewKey,
        organisationUnitCode,
        viewId,
        dashboardGroupId,
      },
      projectCode,
      startDate,
      endDate,
      drillDownLevel,
      isExpanded: true,
    };
    fetchViewData(options);
  }, [startDate, endDate, drillDownLevel, infoViewKey]); // Also consider first render.

  console.log(
    { infoViewKey, viewContent },
    {
      onCloseOverlay,
      contentByLevel,
      errorMessage,
      organisationUnitName,
      onDrillDown,
      onSetDateRange,
      // isLoading, // delete
      startDate,
      endDate,
      projectCode,
      drillDownLevel,
      infoViewKey,
      fetchViewData,
    },
  );
  const onDrillDownReal = chartItem => {
    const { drillDown } = viewContent;

    if (!drillDown) {
      return;
    }

    const newDrillDownLevel = drillDownLevel + 1;

    const { parameterLink, keyLink } = drillDown;
    console.log(chartItem);
    setDrillDownState({
      drillDownLevel: newDrillDownLevel,
      parameterLink,
      parameterValue: chartItem[keyLink],
    });
  };

  const isMatrix = getIsMatrix(viewContent);
  const hasBigData = isMatrix || viewContent?.data?.length > 20;
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

  return (
    <>
      <Dialog
        open
        style={styles.dialog}
        onClose={onCloseOverlay}
        // Unmount on close (maybe)
        scroll={isMobile() ? 'body' : 'paper'}
        PaperProps={{ style: getDialogStyle() }}
      >
        {exportStatus === STATUS.LOADING && <Loader>Exporting...</Loader>}
        <EnlargedDialogContent
          exportRef={exportRef}
          onCloseOverlay={onCloseOverlay}
          viewContent={viewContent}
          organisationUnitName={organisationUnitName}
          onDrillDown={onDrillDownReal}
          onOpenExportDialog={handleOpenExportDialog}
          onSetDateRange={onSetDateRange}
          isLoading={isLoading}
          isExporting={isExporting} // Todo: set exporting theme here?
          errorMessage={errorMessage}
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
  ...state.enlargedDialog, // TODO: Obviously remove...
  projectCode: selectCurrentProjectCode(state),
  viewConfigs: state.global.viewConfigs,
  infoViewKey: selectCurrentInfoViewKey(state),
  viewContent: selectCurrentExpandedViewContent(state), // TODO:
  organisationUnitName: selectCurrentOrgUnit(state).name,
});

const mapDispatchToProps = dispatch => ({
  onSetDateRange: (startDate, endDate) =>
    dispatch(setEnlargedDashboardDateRange(startDate, endDate)),
  fetchViewData: options => {
    dispatch(fetchEnlargedDialogData(options));
  },
  onDrillDown: newDrillDownLevel => {
    dispatch(attemptDrillDown(newDrillDownLevel));
  },
  dispatch,
});

const mergeProps = (stateProps, { dispatch, ...dispatchProps }, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
});

export const EnlargedDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EnlargedDialogComponent);
