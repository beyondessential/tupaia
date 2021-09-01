/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTab from '@material-ui/core/Tab';
import MuiTabs from '@material-ui/core/Tabs';
import { Chart } from '@tupaia/ui-components/lib/chart';
import { FlexSpaceBetween, FetchLoader, DataTable } from '@tupaia/ui-components';
import { TabPanel } from './TabPanel';
import { useVizBuilderConfig } from '../vizBuilderConfigStore';
import { useReportPreview } from '../api';
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

const getColumns = data => {
  const columnKeys = [...new Set(data.map(d => Object.keys(d)).flat())];
  const indexColumn = {
    Header: '#',
    id: 'index',
    accessor: (_row, i) => i + 1,
  };
  const columns = columnKeys.map(columnKey => {
    return {
      Header: columnKey,
      accessor: row => row[columnKey],
    };
  });

  return [indexColumn, ...columns];
};

export const PreviewSection = ({ enabled, setEnabled }) => {
  const [{ project, location, visualisation }, { setPresentation }] = useVizBuilderConfig();
  const [viewContent, setViewContent] = useState(null);
  const { data: reportData = [], isIdle, isLoading, isFetching, isError, error } = useReportPreview(
    visualisation,
    project,
    location,
    enabled,
    setEnabled,
  );
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const columns = useMemo(() => getColumns(reportData), [reportData]);
  const data = useMemo(() => reportData, [reportData]);

  // only update Chart Preview when play button is clicked
  useEffect(() => {
    const newViewContent = { data, ...visualisation.presentation };
    setViewContent(newViewContent);
  }, [enabled]);

  return (
    <>
      <PreviewTabs
        value={tab}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
      >
        <PreviewTab label="Data Preview" />
        <PreviewTab label="Chart Preview" />
      </PreviewTabs>
      <TabPanel isSelected={tab === 0} Panel={PanelTabPanel}>
        <TableContainer>
          {isIdle ? (
            <IdleMessage />
          ) : (
            <FetchLoader
              isLoading={isLoading || isFetching}
              isError={isError}
              error={error}
              isNoData={!reportData.length}
              noDataMessage="No Data Found"
            >
              <StyledTable columns={columns} data={data} />
            </FetchLoader>
          )}
        </TableContainer>
      </TabPanel>
      <TabPanel isSelected={tab === 1} Panel={PanelTabPanel}>
        <Container>
          <ChartContainer>
            {isIdle ? (
              <IdleMessage />
            ) : (
              <FetchLoader isLoading={isLoading || isFetching} isError={isError} error={error}>
                <Chart viewContent={viewContent} />
              </FetchLoader>
            )}
          </ChartContainer>
          <EditorContainer>
            <JsonEditor value={visualisation.presentation} onChange={setPresentation} />
          </EditorContainer>
        </Container>
      </TabPanel>
    </>
  );
};

PreviewSection.propTypes = {
  enabled: PropTypes.bool.isRequired,
  setEnabled: PropTypes.func.isRequired,
};
