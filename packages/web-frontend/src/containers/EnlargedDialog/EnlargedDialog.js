/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toFilename } from '@tupaia/utils';
import styled from 'styled-components';
import { useChartDataExport } from '@tupaia/ui-components/lib/chart';
import {
  fetchEnlargedDialogData,
  setEnlargedDashboardDateRange,
  closeEnlargedDialog,
} from '../../actions';
import { ExportDialog, STATUS } from '../../components/ExportDialog';
import { getIsDataDownload, getIsMatrix } from '../../components/View';
import { EnlargedDialogContent } from './EnlargedDialogContent';
import { isMobile, sleep, getBrowserTimeZone, getUniqueViewId } from '../../utils';
import {
  selectCurrentInfoViewKey,
  selectCurrentOrgUnit,
  selectCurrentProjectCode,
  selectCurrentExpandedDates,
  selectCurrentDashboardCodeForExpandedReport,
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

const compareDate = (date1, date2) => {
  if (!date1 && !date2) {
    return true; // both are undefined
  }

  if (date1 && date2) {
    return date1.isSame(date2);
  }

  return false; // 1 is undefined and 1 is not
};

const hasDrillDownChanged = (options, cachedOptions) =>
  options.infoViewKey !== cachedOptions.infoViewKey ||
  options.drillDownItemKey !== cachedOptions.drillDownItemKey ||
  !compareDate(options.startDate, cachedOptions.startDate) ||
  !compareDate(options.endDate, cachedOptions.endDate) ||
  options.drillDownLevel !== cachedOptions.drillDownLevel ||
  options.parameterLink !== cachedOptions.parameterLink ||
  options.parameterValue !== cachedOptions.parameterValue;

const useDrillDownState = contentByLevel => {
  const [drillDownState, setDrillDownState] = useState({
    drillDownLevel: 0,
    parameterLinks: {},
    parameterValues: {},
  });

  // Regardless of the drillDown level, we pass the base view content through
  const baseViewContent = contentByLevel?.[0]?.viewContent;
  const drillDownContent = contentByLevel?.[drillDownState.drillDownLevel]?.viewContent;
  const baseViewConfig = contentByLevel?.[0]?.viewConfig;
  const drillDownConfig = contentByLevel?.[drillDownState.drillDownLevel]?.viewConfig;

  const viewContent =
    baseViewContent === undefined ? null : { ...baseViewConfig, ...baseViewContent };
  const newDrillDownContent =
    drillDownContent === undefined ? null : { ...drillDownConfig, ...drillDownContent };

  return {
    drillDownConfig,
    drillDownState,
    viewContent,
    newDrillDownContent,
    setDrillDownState,
  };
};

const useExports = viewContent => {
  const config = viewContent?.presentationOptions;

  const [exportOptions, setExportOptions] = useState({
    exportWithLabels: true,
    exportWithTable: false,
  });
  const [exportStatus, setExportStatus] = useState(STATUS.CLOSED);
  const exportRef = useRef(null);

  // Set default export options from config if they are set
  useEffect(() => {
    const exportWithLabels =
      config?.exportWithLabels !== undefined
        ? config.exportWithLabels
        : exportOptions.exportWithLabels;
    const exportWithTable =
      config?.exportWithTable !== undefined
        ? config.exportWithTable
        : exportOptions.exportWithTable;

    setExportOptions({ exportWithLabels, exportWithTable });
  }, [JSON.stringify(config), setExportOptions]);

  return {
    exportRef,
    exportOptions,
    setExportOptions,
    exportStatus,
    setExportStatus,
  };
};

const EnlargedDialogComponent = ({
  onCloseOverlay,
  contentByLevel,
  errorMessage,
  organisationUnitCode,
  organisationUnitName,
  onSetDateRange,
  startDate: startDateForTopLevel,
  endDate: endDateForTopLevel,
  isLoading,
  projectCode,
  dashboardCode,
  infoViewKey,
  fetchViewData,
  drillDownDatesByLevel,
}) => {
  const {
    newDrillDownContent,
    drillDownConfig,
    drillDownState,
    setDrillDownState,
    viewContent,
  } = useDrillDownState(contentByLevel);

  const {
    isMatrix,
    exportRef,
    exportOptions,
    setExportOptions,
    exportStatus,
    setExportStatus,
  } = useExports(viewContent);

  const newViewContent = {
    ...viewContent,
    presentationOptions: {
      ...viewContent?.presentationOptions,
      ...exportOptions,
    },
  };

  const { startDate, endDate } = getDatesForCurrentLevel(
    drillDownState.drillDownLevel,
    startDateForTopLevel,
    endDateForTopLevel,
    drillDownDatesByLevel,
  );

  // This useEffect only acts on the current drillDownLevel
  useEffect(() => {
    const { drillDownLevel, drillDownCode, parameterLinks, parameterValues } = drillDownState;
    const cachedOptions = contentByLevel?.[drillDownLevel]?.options || {};

    const parameterLink = parameterLinks[drillDownLevel];
    const parameterValue = parameterValues[drillDownLevel];
    const currentDrillDownItemKey = drillDownCode
      ? getUniqueViewId(organisationUnitCode, dashboardCode, drillDownCode)
      : null;
    const options = {
      infoViewKey,
      drillDownItemKey: currentDrillDownItemKey,
      startDate,
      endDate,
      drillDownLevel,
      parameterLink,
      parameterValue,
    };

    // No need to refetch if nothing has changed for that drillDownLevel.
    if (!hasDrillDownChanged(options, cachedOptions)) return;

    fetchViewData(options);
  }, [startDate, endDate, drillDownState]);

  const onDrillDown = chartItem => {
    const { drillDown } = drillDownConfig;
    if (!drillDown) return;
    const newDrillDownLevel = drillDownState.drillDownLevel + 1;

    const { parameterLink, keyLink, itemCode: drillDownCode } = drillDown;
    const {
      parameterLinks: oldParameterLinks,
      parameterValues: oldParameterValues,
    } = drillDownState;
    oldParameterLinks[newDrillDownLevel] = parameterLink;
    oldParameterValues[newDrillDownLevel] = chartItem[keyLink];

    setDrillDownState({
      drillDownLevel: newDrillDownLevel,
      drillDownCode,
      parameterLinks: oldParameterLinks,
      parameterValues: oldParameterValues,
    });
  };

  const onUnDrillDown = () => {
    const { drillDownLevel } = drillDownState;

    if (!drillDownLevel) {
      return;
    }

    const previousDrillDownLevel = drillDownLevel - 1;
    const drillDownCode = contentByLevel?.[previousDrillDownLevel]?.viewConfig?.code;

    setDrillDownState({
      ...drillDownState,
      drillDownLevel: previousDrillDownLevel,
      drillDownCode,
    });
  };

  const getDialogStyle = () => {
    const hasBigData = isMatrix || newViewContent?.data?.length > 20;
    if (hasBigData) return styles.largeContainer;
    if (getIsDataDownload(newViewContent)) return styles.smallContainer;
    return styles.container;
  };

  const exportTitle = `${newViewContent?.name}, ${organisationUnitName}`;

  const { doExport } = useChartDataExport(newViewContent, exportTitle);

  const onExport = async format => {
    setExportStatus(STATUS.ANIMATING);
    await sleep(100); // allow some time for the chart transition to finish before hiding the loader
    setExportStatus(STATUS.EXPORTING);

    const filename = toFilename(`export-${organisationUnitName}-${newViewContent.name}`);

    try {
      if (isMatrix && format === 'xlsx') {
        await exportToExcel({
          projectCode,
          dashboardCode,
          viewContent: newViewContent,
          organisationUnitCode,
          organisationUnitName,
          startDate: moment.isMoment(startDate) ? startDate.utc().toISOString() : startDate,
          endDate: moment.isMoment(endDate) ? endDate.utc().toISOString() : endDate,
          timeZone: getBrowserTimeZone(),
          filename,
        });
      } else if (format === 'png') {
        const node = exportRef.current;
        await exportToPng(node, filename);
      } else if (format === 'xlsx') {
        doExport();
      }

      setExportStatus(STATUS.ANIMATING);
      await sleep(1000); // allow some time for the chart transition to finish before hiding the loader
      setExportStatus(STATUS.IDLE);
    } catch (error) {
      setExportStatus(STATUS.ERROR);
    }
  };

  const showLoader = exportStatus === STATUS.EXPORTING || exportStatus === STATUS.ANIMATING;

  return (
    <>
      <Dialog
        open
        style={styles.dialog}
        onClose={onCloseOverlay}
        scroll={isMobile() ? 'body' : 'paper'}
        PaperProps={{ style: getDialogStyle() }}
      >
        {showLoader && <Loader>Exporting...</Loader>}
        <EnlargedDialogContent
          exportRef={exportRef}
          onCloseOverlay={onCloseOverlay}
          viewContent={newViewContent}
          drillDownContent={drillDownState.drillDownLevel === 0 ? null : newDrillDownContent}
          organisationUnitName={organisationUnitName}
          onDrillDown={onDrillDown}
          onOpenExportDialog={() => setExportStatus(STATUS.IDLE)}
          onSetDateRange={onSetDateRange(drillDownState.drillDownLevel)}
          isLoading={isLoading}
          isExporting={exportStatus === STATUS.EXPORTING}
          errorMessage={errorMessage}
          isDrillDownContent={false}
          onUnDrillDown={onUnDrillDown}
          isDrilledDown={drillDownState.drillDownLevel > 0}
        />
      </Dialog>
      <ExportDialog
        status={exportStatus}
        isOpen={exportStatus !== STATUS.CLOSED}
        onClose={() => setExportStatus(STATUS.CLOSED)}
        isMatrix={getIsMatrix(newViewContent)}
        exportOptions={exportOptions}
        setExportOptions={setExportOptions}
        onExport={onExport}
      />
    </>
  );
};

EnlargedDialogComponent.propTypes = {
  onCloseOverlay: PropTypes.func.isRequired,
  contentByLevel: PropTypes.object,
  organisationUnitCode: PropTypes.string,
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
  dashboardCode: PropTypes.string,
};

EnlargedDialogComponent.defaultProps = {
  onSetDateRange: () => {},
  fetchViewData: () => {},
  organisationUnitCode: '',
  organisationUnitName: '',
  contentByLevel: null,
  errorMessage: null,
  startDate: null,
  endDate: null,
  drillDownDatesByLevel: null,
  isLoading: false,
  projectCode: null,
  infoViewKey: null,
  dashboardCode: null,
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
  const currentOrgUnit = selectCurrentOrgUnit(state);
  return {
    startDate,
    endDate,
    isLoading: state.enlargedDialog.isLoading,
    contentByLevel: state.enlargedDialog.contentByLevel,
    errorMessage: state.enlargedDialog.errorMessage,
    drillDownDatesByLevel: state.enlargedDialog.drillDownDatesByLevel,
    infoViewKey: selectCurrentInfoViewKey(state),
    organisationUnitName: currentOrgUnit.name,
    organisationUnitCode: currentOrgUnit.organisationUnitCode,
    projectCode: selectCurrentProjectCode(state),
    dashboardCode: selectCurrentDashboardCodeForExpandedReport(state),
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
