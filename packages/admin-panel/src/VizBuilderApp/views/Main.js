/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBeforeunload } from 'react-beforeunload';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FlexColumn, SmallAlert } from '@tupaia/ui-components';

import { useDashboardVisualisation } from '../api';
import { Toolbar, Panel, PreviewSection, PreviewOptions } from '../components';
import {
  PreviewDataProvider,
  VizConfigErrorProvider,
  useVizConfig,
  JsonEditorProvider,
} from '../context';
import { useMapOverlayVisualisation } from '../api/queries/useMapOverlayVisualisation';
import { VIZ_TYPE_PARAM } from '../constants';

const Container = styled(MuiContainer)`
  flex: 1;
  display: flex;
  align-items: stretch;
`;

const RightCol = styled(FlexColumn)`
  padding-left: 30px;
  flex: 1;
`;

const StyledAlert = styled(SmallAlert)`
  margin: auto;
`;

const Progress = styled(CircularProgress)`
  margin: auto;
`;

// Todo: add warning on page unload https://github.com/jacobbuck/react-beforeunload#readme
export const Main = () => {
  const { visualisationId, vizType } = useParams();

  // do not fetch existing viz if no visualisationId is provided in the params
  const fetchExistingVizEnabled = visualisationId !== undefined;

  const useViz = () => {
    if (vizType === VIZ_TYPE_PARAM.DASHBOARD_ITEM)
      return useDashboardVisualisation(visualisationId, fetchExistingVizEnabled);
    if (vizType === VIZ_TYPE_PARAM.MAP_OVERLAY)
      return useMapOverlayVisualisation(visualisationId, fetchExistingVizEnabled);
    throw new Error(`Unknown viz type ${vizType}`);
  };

  // eslint-disable-next-line no-unused-vars
  const [_, { setVisualisation }] = useVizConfig();
  const [visualisationLoaded, setVisualisationLoaded] = useState(false);
  const { data = {}, error } = useViz();
  const { visualisation } = data;

  useEffect(() => {
    if (visualisation) {
      setVisualisation(visualisation);
      setVisualisationLoaded(true);
    }
  }, [visualisation]);

  useBeforeunload(event => {
    event.preventDefault();
  });

  // Show error if failed to load an existing visualisation
  if (visualisationId && error) {
    return (
      <StyledAlert severity="error" variant="standard">
        {error.message}
      </StyledAlert>
    );
  }

  // Wait until visualisation is loaded to populated the field correctly if we are viewing an existing viz
  if (visualisationId && !visualisationLoaded) {
    return <Progress size={100} />;
  }

  return (
    <>
      <VizConfigErrorProvider>
        <Toolbar />
        <Container maxWidth="xl">
          <PreviewDataProvider>
            <JsonEditorProvider>
              <Panel />
            </JsonEditorProvider>
            <RightCol>
              <PreviewOptions />
              <PreviewSection />
            </RightCol>
          </PreviewDataProvider>
        </Container>
      </VizConfigErrorProvider>
    </>
  );
};
