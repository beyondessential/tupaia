/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { useMeasuresData } from '../api';
import { useUrlParams } from '../utils';
import { MeasurePanel } from '../components';

const Container = styled.div`
  position: relative;
  z-index: 1; // make sure the map is under the site menus & search
  display: flex;
  height: calc(100vh - 265px);
  min-height: 600px;
`;

const Main = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
`;

const DEFAULT_MEASURE_ID = 'Laos_Schools_School_Type';

export const MapView = () => {
  const { entityCode } = useUrlParams();
  const [measureId, setMeasureId] = useState(DEFAULT_MEASURE_ID);

  const { data: measuresData, isLoading } = useMeasuresData({ entityCode });

  return (
    <Container>
      <MeasurePanel
        isLoading={isLoading}
        measures={measuresData ? measuresData.measures : null}
        measureId={measureId}
        setMeasureId={setMeasureId}
      />
      <Main>Map</Main>
    </Container>
  );
};
