/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import Dialog from '@material-ui/core/Dialog';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import { fetchEnlargedDialogData, setEnlargedDashboardDateRange } from '../../actions';
import { ExportDialog } from '../../components/ExportDialog';
import { getIsDataDownload, getIsMatrix, VIEW_CONTENT_SHAPE } from '../../components/View';
import {
  selectCurrentInfoViewKey,
  selectCurrentOrgUnit,
  selectCurrentExpandedViewContent,
  selectCurrentProjectCode,
} from '../../selectors';
import { DIALOG_Z_INDEX } from '../../styles';
import { getInfoFromInfoViewKey, isMobile, sleep, stringToFilename } from '../../utils';
import { exportToExcel, exportToPng } from '../../utils/exports';
import { EnlargedDialogContent } from './EnlargedDialogContent';
import { LoadingIndicator } from '../Form/common';

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

const EnlargedDialogComponent = props => {
  const {
    onCloseOverlay,
    contentByLevel,
    errorMessage,
    organisationUnitName,
    onSetDateRange,
    startDate,
    endDate,
    isLoading,
    initialViewContent,
    projectCode,
    infoViewKey,
    fetchViewData,
  } = props;
  const exportRef = React.useRef(null);
  const [exportDialogIsOpen, setExportDialogIsOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const [exportStatus, setExportStatus] = React.useState(STATUS.IDLE);
  const [drillDownState, setDrillDownState] = React.useState({
    drillDownLevel: 0,
    parameterLink: null,
    parameterValue: null,
  });

  const viewContent = contentByLevel?.[drillDownState.drillDownLevel]?.viewContent;

  const { organisationUnitCode, dashboardGroupId, viewId } = getInfoFromInfoViewKey(infoViewKey);

  React.useEffect(() => {
    if (!viewId) return;

    // No need to refetch if everything is default
    if (!startDate && !endDate && !drillDownState.drillDownLevel === 0) return;

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
      isExpanded: true,
      ...drillDownState,
    };
    fetchViewData(options);
    // TODO: Only refetching on parameterValue change is a bit hacky... We rely on not refetching here...
  }, [startDate, endDate, drillDownState.parameterValue, infoViewKey]);

  const onDrillDown = chartItem => {
    const { drillDown } = viewContent;
    if (!drillDown) return;

    const { parameterLink, keyLink } = drillDown;
    setDrillDownState({
      drillDownLevel: drillDownState.drillDownLevel + 1,
      parameterLink,
      parameterValue: chartItem[keyLink],
    });
  };

  const onUnDrillDown = () => {
    setDrillDownState({
      ...drillDownState,
      drillDownLevel: drillDownState.drillDownLevel - 1,
    });
  };

  const isMatrix = getIsMatrix(viewContent);

  const getDialogStyle = () => {
    const hasBigData = isMatrix || viewContent?.data?.length > 20;
    if (hasBigData) return styles.largeContainer;
    if (getIsDataDownload(viewContent)) return styles.smallContainer;
    return styles.container;
  };

  const exportFormats = isMatrix ? ['xlsx'] : ['png'];

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
        scroll={isMobile() ? 'body' : 'paper'}
        PaperProps={{ style: getDialogStyle() }}
      >
        {isLoading && (
          <Loader>
            <CircularProgress />
          </Loader>
        )}
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
          isDrilledDown={drillDownState.drillDownLevel > 0}
          onUnDrillDown={onUnDrillDown}
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
  contentByLevel: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
  organisationUnitName: PropTypes.string.isRequired,
  onSetDateRange: PropTypes.func,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  projectCode: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

EnlargedDialogComponent.defaultProps = {
  onSetDateRange: () => {},
  errorMessage: null,
  startDate: null,
  endDate: null,
  projectCode: null,
  isLoading: false,
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
  isLoading: state.enlargedDialog.isLoading,
  contentByLevel: state.enlargedDialog.contentByLevel,
  startDate: state.enlargedDialog.startDate,
  endDate: state.enlargedDialog.endDate,
  errorMessage: state.enlargedDialog.errorMessage,
  projectCode: selectCurrentProjectCode(state),
  infoViewKey: selectCurrentInfoViewKey(state),
  initialViewContent: selectCurrentExpandedViewContent(state),
  organisationUnitName: selectCurrentOrgUnit(state).name,
});

const mapDispatchToProps = dispatch => ({
  onSetDateRange: (startDate, endDate) =>
    dispatch(setEnlargedDashboardDateRange(startDate, endDate)),
  fetchViewData: options => {
    dispatch(fetchEnlargedDialogData(options));
  },
});

export const EnlargedDialog = connect(mapStateToProps, mapDispatchToProps)(EnlargedDialogComponent);
