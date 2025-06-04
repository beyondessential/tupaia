import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import MuiTab from '@material-ui/core/Tab';
import MuiTabs from '@material-ui/core/Tabs';
import { DataGrid, FetchLoader, FlexSpaceBetween } from '@tupaia/ui-components';
import { Chart } from '@tupaia/ui-chart-components';
import { JsonEditor } from '../../widgets';
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
import { PresentationConfigAssistant } from '../features/PresentationConfigAssistant/PresentationConfigAssistant';
import { PresentationJsonToggle } from './JsonToggleButton';

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

const ChartPreviewSidebar = styled.article`
  block-size: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  border-block-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  border-inline-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
`;

const EditorActionBar = styled.header`
  background-color: white;
  border-block-end: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  display: flex;
  justify-content: end;
`;

const EditorContainer = styled.div`
  width: 320px;
  min-height: 500px;
  display: flex;
  flex-direction: column;

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
  const { fetchEnabled, setFetchEnabled, showData, showPresentationAsJson } =
    usePreviewDataContext();
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

  const runReportPreview = previewMode =>
    useReportPreview({
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
      previewMode,
    });

  const {
    data: tableData = { columns: [], rows: [] },
    isLoading: isTableLoading,
    isFetching: isTableFetching,
    isError: isTableError,
    error: tableError,
  } = runReportPreview('data');

  const {
    data: visualisationData,
    isLoading: isVisualisationLoading,
    isFetching: isVisualisationFetching,
    isError: isVisualisationError,
    error: visualisationError,
  } = runReportPreview('presentation');

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

  const { columns: transformedColumns = [] } = tableData;
  const columns = useMemo(() => (tab === 0 ? getColumns(tableData) : []), [tableData]);
  const rows = useMemo(() => (tab === 0 ? getRows(tableData) || [] : []), [tableData]);
  const report = useMemo(
    () => ({ data: visualisationData, type: visualisation?.output?.type }),
    [visualisationData],
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
              isLoading={isTableLoading || isTableFetching}
              isError={isTableError}
              error={tableError}
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
              <FetchLoader
                isLoading={isVisualisationLoading || isVisualisationFetching}
                isError={isVisualisationError}
                error={visualisationError}
              >
                <Chart report={report} config={config} />
              </FetchLoader>
            ) : (
              <IdleMessage />
            )}
          </ChartContainer>
          <ChartPreviewSidebar>
            <EditorActionBar>
              <PresentationJsonToggle />
            </EditorActionBar>
            {!showPresentationAsJson && presentationSchema ? (
              <PresentationConfigAssistant
                dataStructure={{ columns: transformedColumns }}
                setPresentationValue={setPresentationValue}
              />
            ) : (
              <EditorContainer>
                <JsonEditor
                  value={visualisation.presentation}
                  onChange={setPresentationValue}
                  onInvalidChange={handleInvalidPresentationChange}
                  mode="code"
                  mainMenuBar={false}
                  schema={presentationSchema}
                />
              </EditorContainer>
            )}
          </ChartPreviewSidebar>
        </Container>
      </TabPanel>
    </>
  );
};
