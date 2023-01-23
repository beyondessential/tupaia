/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import MuiTab from '@material-ui/core/Tab';
import MuiTabs from '@material-ui/core/Tabs';
import { Chart, FlexSpaceBetween, FetchLoader, DataTable } from '@tupaia/ui-components';

import { TabPanel } from './TabPanel';
import { useReportPreview } from '../api';
import { usePreviewData, useVisualisation, useVizConfig, useVizConfigError } from '../context';
import { JsonEditor } from './JsonEditor';
import { IdleMessage } from './IdleMessage';

const PreviewTabs = styled(MuiTabs)`
  background: white;
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-bottom: none;

  .MuiTabs-indicator {
    height: 5px;
  }
`;

const PreviewTab = styled(MuiTab)`
  font-size: 15px;
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

const StyledTable = styled(DataTable)`
  table {
    border-top: 1px solid ${({ theme }) => theme.palette.grey['400']};
    border-bottom: 1px solid ${({ theme }) => theme.palette.grey['400']};
    table-layout: auto;

    thead {
      text-transform: none;
    }
  }
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

const convertValueToPrimitive = val => {
  if (val === null) return val;
  switch (typeof val) {
    case 'object':
      return JSON.stringify(val);
    case 'function':
      return '[Function]';
    default:
      return val;
  }
};

const getColumns = ({ columns: columnKeys = [] }) => {
  const indexColumn = {
    Header: '#',
    id: 'index',
    accessor: (_row, i) => i + 1,
  };
  const columns = columnKeys.map(columnKey => {
    return {
      Header: columnKey,
      accessor: row => convertValueToPrimitive(row[columnKey]),
    };
  });

  return [indexColumn, ...columns];
};

export const PreviewSection = () => {
  const [tab, setTab] = useState(0);

  const { fetchEnabled, setFetchEnabled, showData } = usePreviewData();
  const { hasPresentationError, setPresentationError } = useVizConfigError();

  const [{ project, location, testData }, { setPresentation }] = useVizConfig();
  const { visualisationForFetchingData: visualisation } = useVisualisation();

  const [viewContent, setViewContent] = useState(null);

  const { vizType } = useParams();

  const {
    data: reportData = { columns: [], rows: [] },
    isLoading,
    isFetching,
    isError,
    error,
  } = useReportPreview({
    visualisation,
    project,
    location,
    testData,
    enabled: fetchEnabled,
    onSettled: () => {
      setFetchEnabled(false);
    },
    vizType,
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
  const rows = useMemo(() => (tab === 0 ? reportData.rows || [] : []), [reportData]);
  const data = useMemo(() => reportData, [reportData]);

  // only update Chart Preview when play button is clicked
  useEffect(() => {
    const newViewContent = { data, ...visualisation.presentation };
    setViewContent(newViewContent);
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
              <StyledTable columns={columns} data={rows} rowLimit={100} />
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
                <Chart viewContent={viewContent} />
              </FetchLoader>
            ) : (
              <IdleMessage />
            )}
          </ChartContainer>
          <EditorContainer>
            <JsonEditor
              value={visualisation.presentation}
              onChange={setPresentationValue}
              onInvalidChange={handleInvalidPresentationChange}
            />
          </EditorContainer>
        </Container>
      </TabPanel>
    </>
  );
};
