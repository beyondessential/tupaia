import React from 'react';
import styled from 'styled-components';
import { FlexColumn, FlexSpaceBetween } from '@tupaia/ui-components';
import { JsonEditor } from '../../widgets';
import { TabPanel } from './TabPanel';
import { PlayButton } from './PlayButton';
import { JsonToggleButton } from './JsonToggleButton';
import {
  usePreviewDataContext,
  useVisualisationContext,
  useVizConfigContext,
  useVizConfigErrorContext,
} from '../context';
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
  const { setDataError } = useVizConfigErrorContext();
  const { jsonToggleEnabled } = usePreviewDataContext();
  const [
    {
      visualisation: { data: dataWithConfig },
    },
    { setDataConfig },
  ] = useVizConfigContext();

  const {
    visualisation: { data: vizData },
  } = useVisualisationContext();

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

  const jsonEditorProps = {
    mode: 'code',
    mainMenuBar: false,
  };

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
            {...jsonEditorProps}
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
