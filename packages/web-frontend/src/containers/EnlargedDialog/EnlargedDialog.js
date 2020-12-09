/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import Dialog from '@material-ui/core/Dialog';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import shallowEqual from 'shallowequal';
import styled from 'styled-components';
import {
  fetchEnlargedDialogData,
  setEnlargedDashboardDateRange,
  closeEnlargedDialog,
} from '../../actions';
import { ExportDialog } from '../../components/ExportDialog';
import { getIsDataDownload, getIsMatrix, VIEW_CONTENT_SHAPE } from '../../components/View';
import { EnlargedDialogContent } from './EnlargedDialogContent';
import { isMobile, sleep, stringToFilename, getBrowserTimeZone } from '../../utils';
import {
  selectCurrentInfoViewKey,
  selectCurrentOrgUnit,
  selectCurrentProjectCode,
  selectCurrentExpandedDates,
} from '../../selectors';
import { DARK_BLUE, DIALOG_Z_INDEX } from '../../styles';
import { exportToExcel, exportToPng } from '../../utils/exports';

const Loader = styled.div`
  display: block;
  position: absolute;
  top: 0;
  height: 100%;
  left: 0;
  right: 0;
  background: ${DARK_BLUE};
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

const getDatesForCurrentLevel = (
  drillDownLevel,
  startDateForTopLevel,
  endDateForTopLevel,
  drillDownDatesByLevel,
) => {
  if (drillDownLevel === 0) {
    return {
      startDate: startDateForTopLevel,
      endDate: endDateForTopLevel,
    };
  }
  return drillDownDatesByLevel?.[drillDownLevel] || {};
};

const EnlargedDialogComponent = ({
  onCloseOverlay,
  contentByLevel,
  errorMessage,
  organisationUnitName,
  onSetDateRange,
  startDate: startDateForTopLevel,
  endDate: endDateForTopLevel,
  isLoading,
  projectCode,
  infoViewKey,
  fetchViewData,
  drillDownDatesByLevel,
}) => {
  const exportRef = useRef(null);
  const [exportDialogIsOpen, setExportDialogIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [exportStatus, setExportStatus] = useState(STATUS.IDLE);
  const [drillDownState, setDrillDownState] = useState({
    drillDownLevel: 0,
    parameterLinks: {},
    parameterValues: {},
  });

  // Regardless of the drillDown level, we pass the base view content through
  const baseViewContent = contentByLevel?.[0]?.viewContent;
  const drillDownContent = contentByLevel?.[drillDownState.drillDownLevel]?.viewContent;

  const { startDate, endDate } = getDatesForCurrentLevel(
    drillDownState.drillDownLevel,
    startDateForTopLevel,
    endDateForTopLevel,
    drillDownDatesByLevel,
  );

  // This useEffect only acts on the current drillDownLevel
  useEffect(() => {
    const { drillDownLevel, parameterLinks, parameterValues } = drillDownState;
    const cachedOptions = contentByLevel?.[drillDownLevel]?.options;

    const parameterLink = parameterLinks[drillDownLevel];
    const parameterValue = parameterValues[drillDownLevel];

    const options = {
      infoViewKey,
      startDate,
      endDate,
      drillDownLevel,
      parameterLink,
      parameterValue,
    };

    // No need to refetch if nothing has changed for that drillDownLevel.
    // Note: this means that all options are strings, numbers etc.
    if (shallowEqual(options, cachedOptions)) return;

    fetchViewData(options);
  }, [startDate, endDate, drillDownState]);

  const onDrillDown = chartItem => {
    const { drillDown } = drillDownContent;
    if (!drillDown) return;
    const newDrillDownLevel = drillDownState.drillDownLevel + 1;

    const { parameterLink, keyLink } = drillDown;
    const {
      parameterLinks: oldParameterLinks,
      parameterValues: oldParameterValues,
    } = drillDownState;
    oldParameterLinks[newDrillDownLevel] = parameterLink;
    oldParameterValues[newDrillDownLevel] = chartItem[keyLink];

    setDrillDownState({
      drillDownLevel: newDrillDownLevel,
      parameterLinks: oldParameterLinks,
      parameterValues: oldParameterValues,
    });
  };

  const onUnDrillDown = () => {
    setDrillDownState({
      ...drillDownState,
      drillDownLevel: drillDownState.drillDownLevel - 1,
    });
  };

  const isMatrix = getIsMatrix(baseViewContent);

  const getDialogStyle = () => {
    const hasBigData = isMatrix || baseViewContent?.data?.length > 20;
    if (hasBigData) return styles.largeContainer;
    if (getIsDataDownload(baseViewContent)) return styles.smallContainer;
    return styles.container;
  };

  const exportFormats = isMatrix ? ['xlsx'] : ['png'];

  const onExport = async format => {
    setExportStatus(STATUS.LOADING);
    setIsExporting(true);

    const filename = stringToFilename(`export-${organisationUnitName}-${baseViewContent.name}`);

    try {
      if (format === 'xlsx') {
        await exportToExcel({
          projectCode,
          viewContent: baseViewContent,
          organisationUnitName,
          startDate,
          endDate,
          timeZone: getBrowserTimeZone(),
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
        {exportStatus === STATUS.LOADING && <Loader>Exporting...</Loader>}
        <EnlargedDialogContent
          exportRef={exportRef}
          onCloseOverlay={onCloseOverlay}
          viewContent={baseViewContent}
          drillDownContent={drillDownState.drillDownLevel === 0 ? null : drillDownContent}
          organisationUnitName={organisationUnitName}
          onDrillDown={onDrillDown}
          onOpenExportDialog={handleOpenExportDialog}
          onSetDateRange={onSetDateRange(drillDownState.drillDownLevel)}
          isLoading={isLoading}
          isExporting={isExporting} // Todo: set exporting theme here?
          errorMessage={errorMessage}
          isDrillDownContent={false}
          onUnDrillDown={onUnDrillDown}
          isDrilledDown={drillDownState.drillDownLevel > 0}
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
  contentByLevel: PropTypes.any,
  organisationUnitName: PropTypes.string,
  onSetDateRange: PropTypes.func,
  fetchViewData: PropTypes.func,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  drillDownDatesByLevel: PropTypes.object,
  projectCode: PropTypes.string,
  infoViewKey: PropTypes.string,
  onCloseOverlay: PropTypes.func.isRequired,
};

EnlargedDialogComponent.defaultProps = {
  onSetDateRange: () => {},
  fetchViewData: () => {},
  organisationUnitName: '',
  contentByLevel: null,
  errorMessage: null,
  startDate: null,
  endDate: null,
  drillDownDatesByLevel: null,
  isLoading: false,
  projectCode: null,
  infoViewKey: null,
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

const mapStateToProps = state => {
  const { startDate, endDate } = selectCurrentExpandedDates(state);
  return {
    startDate,
    endDate,
    isLoading: state.enlargedDialog.isLoading,
    contentByLevel: state.enlargedDialog.contentByLevel,
    errorMessage: state.enlargedDialog.errorMessage,
    drillDownDatesByLevel: state.enlargedDialog.drillDownDatesByLevel,
    infoViewKey: selectCurrentInfoViewKey(state),
    organisationUnitName: selectCurrentOrgUnit(state).name,
    projectCode: selectCurrentProjectCode(state),
  };
};

const mapDispatchToProps = dispatch => ({
  onSetDateRange: drillDownLevel => (startDate, endDate) =>
    dispatch(setEnlargedDashboardDateRange(drillDownLevel, startDate, endDate)),
  fetchViewData: options => {
    dispatch(fetchEnlargedDialogData(options));
  },
  onCloseOverlay: () => dispatch(closeEnlargedDialog()),
});

export const EnlargedDialog = connect(mapStateToProps, mapDispatchToProps)(EnlargedDialogComponent);
