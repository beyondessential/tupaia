/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { FlexColumn, FlexSpaceBetween } from '@tupaia/ui-components';
import { TabPanel } from './TabPanel';
import { JsonEditor } from './JsonEditor';
import { PlayButton } from './PlayButton';
import { JsonToggleButton } from './JsonToggleButton';
import { useTabPanel, useVizConfig, useVisualisation, useVizConfigError } from '../context';
import { TransformDataLibrary } from './DataLibrary';

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
  const { setDataError } = useVizConfigError();
  const { jsonToggleEnabled } = useTabPanel();
  const [
    {
      visualisation: { data: dataWithConfig },
    },
    { setDataConfig },
  ] = useVizConfig();

  const {
    visualisation: { data: vizData },
  } = useVisualisation();

  const handleInvalidChange = errMsg => {
    setDataError(errMsg);
  };

  const setTabValue = (tabName, value) => {
    setDataConfig(tabName, value);
    setDataError(null);
  };

  const isCustomReport = 'customReport' in vizData;
  // Custom report vizes don't support any configuration so just show the name
  if (isCustomReport) {
    return (
      <Container>
        <PanelNav>
          <>Custom Report: {vizData.customReport}</>
          <PlayButton />
        </PanelNav>
      </Container>
    );
  }

  return (
    <Container>
      <PanelNav>
        <JsonToggleButton />
        <PlayButton />
      </PanelNav>

      <TabPanel isSelected Panel={PanelTabPanel}>
        {jsonToggleEnabled ? (
          <JsonEditor
            value={vizData.transform}
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
