import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import MuiTab from '@material-ui/core/Tab';
import MuiTabs from '@material-ui/core/Tabs';
import { DataGrid, FetchLoader, FlexSpaceBetween } from '@tupaia/ui-components';
import { Chart } from '@tupaia/ui-chart-components';
import { JsonEditor, JsonTreeEditor } from '../../widgets';
import { TabPanel } from './TabPanel';
import { useReportPreview } from '../api';
import {
  usePreviewDataContext,
  useVisualisationContext,
  useVizConfigContext,
  useVizConfigErrorContext,
} from '../context';
import { IdleMessage } from './IdleMessage';
import { getColumns, getRows } from '../../utilities';
import {
  DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM,
  DASHBOARD_ITEM_VIZ_TYPES,
  MAP_OVERLAY_VIZ_TYPES,
} from '../constants';

const PreviewTabs = styled(MuiTabs)`
  background: white;
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-bottom: none;

  .MuiTabs-indicator {
    height: 5px;
  }
`;

const PreviewTab = styled(MuiTab)`
  line-height: 140%;
  font-weight: 400;
  min-width: 100px;
  padding-top: 20px;
  padding-bottom: 20px;
`;

const PanelTabPanel = styled.div`
  flex: 1;
  background: white;
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-top: none;
`;

const Container = styled(FlexSpaceBetween)`
  align-items: stretch;
  flex-wrap: wrap;
  height: 100%;
`;

const TableContainer = styled.div`
  display: flex;
  height: 100%;
`;

const ChartContainer = styled.div`
  display: flex;
  padding: 4rem 2rem 2rem;
  max-height: 550px;
  min-height: 450px;
  min-width: 540px;
  flex: 2;
  border-top: 1px solid ${({ theme }) => theme.palette.grey['400']};
`;

const EditorContainer = styled.div`
  min-width: 440px;
  min-height: 500px;
  flex: 1;
  border-top: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-left: 1px solid ${({ theme }) => theme.palette.grey['400']};

  > div {
    width: 100%;
    height: 100%;
  }

  .jsoneditor {
    border: none;
  }
`;

const TABS = {
  DATA: {
    index: 0,
    label: 'Data Preview',
    previewMode: 'data',
  },
  CHART: {
    index: 1,
    label: 'Chart Preview',
    previewMode: 'presentation',
  },
};

const getTab = index => Object.values(TABS).find(tab => tab.index === index);

export const PreviewSection = () => {
  const [tab, setTab] = useState(0);

  const { dashboardItemOrMapOverlay } = useParams();
  const { fetchEnabled, setFetchEnabled, showData, jsonToggleEnabled } = usePreviewDataContext();
  const { hasPresentationError, setPresentationError } = useVizConfigErrorContext();

  const [
    { vizType, project, location, startDate, endDate, testData, visualisation },
    { setPresentation },
  ] = useVizConfigContext();
  const { visualisationForFetchingData } = useVisualisationContext();

  const presentationSchema =
    dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.DASHBOARD_ITEM
      ? DASHBOARD_ITEM_VIZ_TYPES[vizType]?.schema
      : MAP_OVERLAY_VIZ_TYPES[vizType]?.schema;

  const [config, setConfig] = useState(null);

  const {
    data: reportData = { columns: [], rows: [] },
    isLoading,
    isFetching,
    isError,
    error,
  } = useReportPreview({
    visualisation: visualisationForFetchingData,
    project: project?.['project.code'],
    location: location?.code,
    startDate,
    endDate,
    testData,
    enabled: fetchEnabled,
    onSettled: () => {
      setFetchEnabled(false);
    },
    dashboardItemOrMapOverlay,
    previewMode: getTab(tab).previewMode,
  });

  const handleChange = (event, newValue) => {
    setTab(newValue);
    setFetchEnabled(true);
  };

  const handleInvalidPresentationChange = errMsg => {
    setPresentationError(errMsg);
  };

  const setPresentationValue = value => {
    setPresentation(value);
    setPresentationError(null);
  };

  const columns = useMemo(() => (tab === 0 ? getColumns(reportData) : []), [reportData]);
  const rows = useMemo(() => (tab === 0 ? getRows(reportData) || [] : []), [reportData]);
  const report = useMemo(
    () => ({
      data: reportData,
      type: visualisation?.output?.type,
    }),
    [reportData],
  );

  // only update Chart Preview when play button is clicked
  useEffect(() => {
    setConfig(visualisation.presentation);
  }, [fetchEnabled]);

  return (
    <>
      <PreviewTabs
        value={tab}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
      >
        <PreviewTab label={TABS.DATA.label} disabled={hasPresentationError} />
        <PreviewTab label={TABS.CHART.label} />
      </PreviewTabs>
      <TabPanel isSelected={getTab(tab) === TABS.DATA} Panel={PanelTabPanel}>
        <TableContainer>
          {showData ? (
            <FetchLoader
              isLoading={isLoading || isFetching}
              isError={isError}
              error={error}
              isNoData={!rows.length}
              noDataMessage="No Data Found"
            >
              <DataGrid rows={rows} columns={columns} autoPageSize />
            </FetchLoader>
          ) : (
            <IdleMessage />
          )}
        </TableContainer>
      </TabPanel>
      <TabPanel isSelected={getTab(tab) === TABS.CHART} Panel={PanelTabPanel}>
        <Container>
          <ChartContainer>
            {showData ? (
              <FetchLoader isLoading={isLoading || isFetching} isError={isError} error={error}>
                <Chart report={report} config={config} />
              </FetchLoader>
            ) : (
              <IdleMessage />
            )}
          </ChartContainer>
          <EditorContainer>
            {!jsonToggleEnabled && presentationSchema ? (
              <JsonTreeEditor
                name="presentation"
                value={visualisation.presentation}
                onChange={setPresentationValue}
                onInvalidChange={handleInvalidPresentationChange}
                mainMenuBar={false}
                schema={presentationSchema}
              />
            ) : (
              <JsonEditor
                value={visualisation.presentation}
                onChange={setPresentationValue}
                onInvalidChange={handleInvalidPresentationChange}
                mode="code"
                mainMenuBar={false}
                schema={presentationSchema}
              />
            )}
          </EditorContainer>
        </Container>
      </TabPanel>
    </>
  );
};
