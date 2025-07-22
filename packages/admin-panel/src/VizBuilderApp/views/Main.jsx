import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBeforeunload } from 'react-beforeunload';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FlexColumn, SmallAlert } from '@tupaia/ui-components';
import { useDashboardVisualisation } from '../api';
import { Panel, PreviewOptions, PreviewSection, Toolbar } from '../components';
import { PreviewDataProvider, useVizConfigContext, VizConfigErrorProvider } from '../context';
import { useMapOverlayVisualisation } from '../api/queries/useMapOverlayVisualisation';
import {
  DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM,
  DASHBOARD_ITEM_VIZ_TYPES,
  MAP_OVERLAY_VIZ_TYPES,
} from '../constants';
import { findVizType } from '../utils';

const Container = styled(MuiContainer)`
  flex: 1;
  display: flex;
  align-items: stretch;
`;

const RightCol = styled(FlexColumn)`
  padding-left: 30px;
  flex: 1;
  // To solve overflow problem of data table content, use min-width: 0 https://stackoverflow.com/a/66689926
  min-width: 0;
`;

const StyledAlert = styled(SmallAlert)`
  margin: auto;
`;

const Progress = styled(CircularProgress)`
  margin: auto;
`;

export const Main = () => {
  const { visualisationId, dashboardItemOrMapOverlay } = useParams();

  // do not fetch existing viz if no visualisationId is provided in the params
  const fetchExistingVizEnabled = visualisationId !== undefined;

  const useViz = () => {
    if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.DASHBOARD_ITEM)
      return useDashboardVisualisation(visualisationId, fetchExistingVizEnabled);
    if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.MAP_OVERLAY)
      return useMapOverlayVisualisation(visualisationId, fetchExistingVizEnabled);
    throw new Error(`Unknown viz type ${dashboardItemOrMapOverlay}`);
  };

  const [, { setVisualisation, setVizType }] = useVizConfigContext();
  const [visualisationLoaded, setVisualisationLoaded] = useState(false);
  const { data = {}, error } = useViz();
  const { visualisation } = data;

  useEffect(() => {
    if (visualisation) {
      setVisualisation(visualisation);
      const vizType =
        dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.DASHBOARD_ITEM
          ? findVizType(visualisation, DASHBOARD_ITEM_VIZ_TYPES)
          : findVizType(visualisation, MAP_OVERLAY_VIZ_TYPES);
      setVizType(vizType);
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
    <VizConfigErrorProvider>
      <Toolbar />
      <Container maxWidth="xl">
        <PreviewDataProvider>
          <Panel />
          <RightCol>
            <PreviewOptions />
            <PreviewSection />
          </RightCol>
        </PreviewDataProvider>
      </Container>
    </VizConfigErrorProvider>
  );
};
