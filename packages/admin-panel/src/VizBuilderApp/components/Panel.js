/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import MuiTab from '@material-ui/core/Tab';
import ChevronRight from '@material-ui/icons/ChevronRight';
import MuiTabs from '@material-ui/core/Tabs';
import { FlexColumn, FlexSpaceBetween } from '@tupaia/ui-components';
import { TabPanel } from './TabPanel';
import { JsonEditor } from './JsonEditor';
import { PlayButton } from './PlayButton';
import { useVizBuilderConfig } from '../context';

const Container = styled(FlexColumn)`
  position: relative;
  width: 440px;
  background: white;
  border-right: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-left: 1px solid ${({ theme }) => theme.palette.grey['400']};
`;

const PanelNav = styled(FlexSpaceBetween)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey['400']};
  padding-right: 1rem;
`;

const Tabs = styled(MuiTabs)`
  width: 100%;
  padding-right: 1.6rem;

  .MuiTabs-indicator {
    height: 5px;
  }
`;

const Tab = styled(MuiTab)`
  position: relative;
  font-size: 15px;
  line-height: 140%;
  font-weight: 400;
  min-width: 100px;
  padding-top: 20px;
  padding-bottom: 20px;
  overflow: visible;

  .MuiSvgIcon-root {
    position: absolute;
    top: 50%;
    transform: translate(50%, -50%);
    right: 0;
    color: ${({ theme }) => theme.palette.grey['400']};
  }
`;

const PanelTabPanel = styled.div`
  flex: 1;

  > div {
    width: 100%;
    height: 100%;
  }

  .jsoneditor {
    border: none;
  }
`;

export const Panel = () => {
  const [tab, setTab] = useState(0);
  const [
    {
      visualisation: { data: dataConfig },
    },
    { setDataConfig, setFetchConfig },
  ] = useVizBuilderConfig();

  const { dataElements, dataGroups, startDate, endDate, aggregations, transform } = dataConfig;

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const fetchValue = {
    dataElements,
    dataGroups,
    startDate,
    endDate,
  };

  return (
    <Container>
      <PanelNav>
        <Tabs
          value={tab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
        >
          <Tab label="Fetch" icon={<ChevronRight />} />
          <Tab label="Aggregate" icon={<ChevronRight />} />
          <Tab label="Transform" />
        </Tabs>
        <PlayButton />
      </PanelNav>
      <TabPanel isSelected={tab === 0} Panel={PanelTabPanel}>
        <JsonEditor value={fetchValue} onChange={value => setFetchConfig(value)} />
      </TabPanel>
      <TabPanel isSelected={tab === 1} Panel={PanelTabPanel}>
        <JsonEditor value={aggregations} onChange={value => setDataConfig('aggregations', value)} />
      </TabPanel>
      <TabPanel isSelected={tab === 2} Panel={PanelTabPanel}>
        <JsonEditor value={transform} onChange={value => setDataConfig('transform', value)} />
      </TabPanel>
    </Container>
  );
};
