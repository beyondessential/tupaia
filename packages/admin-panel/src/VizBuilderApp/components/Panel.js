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
import { JsonToggleButton } from './JsonToggleButton';
import { useTabPanel, useVizConfig, useVisualisation, useVizConfigError } from '../context';
import {
  DataElementDataLibrary,
  AggregationDataLibrary,
  TransformDataLibrary,
} from './DataLibrary';

const Container = styled(FlexColumn)`
  position: relative;
  width: 540px;
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
  display: flex;
  flex-direction: column;

  > div {
    width: 100%;
    height: 100%;
  }

  .jsoneditor {
    border: none;
    min-height: 500px;
  }
`;

export const Panel = () => {
  const { hasDataError, setDataError } = useVizConfigError();
  const { jsonToggleEnabled } = useTabPanel();
  const [tab, setTab] = useState(0);
  const [
    {
      visualisation: { data: dataWithConfig },
    },
    { setDataConfig },
  ] = useVizConfig();

  const {
    visualisation: { data: finalData },
  } = useVisualisation();

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleInvalidChange = errMsg => {
    setDataError(errMsg);
  };

  const setTabValue = (tabName, value) => {
    setDataConfig(tabName, value);
    setDataError(null);
  };

  const isTabDisabled = tabId => {
    return tab !== tabId && hasDataError;
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
          <Tab disabled={isTabDisabled(0)} label="Fetch" icon={<ChevronRight />} />
          <Tab disabled={isTabDisabled(1)} label="Aggregate" icon={<ChevronRight />} />
          <Tab disabled={isTabDisabled(2)} label="Transform" />
        </Tabs>
        <JsonToggleButton />
        <PlayButton />
      </PanelNav>
      <TabPanel isSelected={tab === 0} Panel={PanelTabPanel}>
        {jsonToggleEnabled ? (
          <JsonEditor
            value={finalData.fetch}
            onChange={value => setTabValue('fetch', value)}
            onInvalidChange={handleInvalidChange}
          />
        ) : (
          <DataElementDataLibrary
            fetch={dataWithConfig.fetch}
            onFetchChange={value => {
              setTabValue('fetch', value);
            }}
          />
        )}
      </TabPanel>
      <TabPanel isSelected={tab === 1} Panel={PanelTabPanel}>
        {jsonToggleEnabled ? (
          <JsonEditor
            value={finalData.aggregate}
            onChange={value => setTabValue('aggregate', value)}
            onInvalidChange={handleInvalidChange}
          />
        ) : (
          <AggregationDataLibrary
            aggregate={dataWithConfig.aggregate}
            onAggregateChange={value => {
              setTabValue('aggregate', value);
            }}
            onInvalidChange={handleInvalidChange}
          />
        )}
      </TabPanel>
      <TabPanel isSelected={tab === 2} Panel={PanelTabPanel}>
        {jsonToggleEnabled ? (
          <JsonEditor
            value={finalData.transform}
            onChange={value => setTabValue('transform', value)}
            onInvalidChange={handleInvalidChange}
          />
        ) : (
          <TransformDataLibrary
            transform={dataWithConfig.transform}
            onTransformChange={value => {
              setTabValue('transform', value);
            }}
            onInvalidChange={handleInvalidChange}
          />
        )}
      </TabPanel>
    </Container>
  );
};
