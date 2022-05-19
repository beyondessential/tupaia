import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';

import { useEntityData, useVitalsData } from '../../../api';
import { useUrlParams } from '../../../utils';
import { VITALS_VIEWS } from '../../../views/VitalsView';
import { VitalsLoader } from '../../VitalsLoader';

const Container = styled(MuiContainer)`
  display: grid;
  grid-template-columns: minmax(580px, 2.5fr) 2fr 1fr;
  column-gap: 15px;
  row-gap: 15px;

  ${props => props.theme.breakpoints.down('sm')} {
    display: block;
  }
`;

export const EntityDetails = () => {
  const { entityCode } = useUrlParams();
  const { data: entityData } = useEntityData(entityCode);
  const { data: vitals, isLoading } = useVitalsData(entityCode);
  const { type: entityType } = entityData;

  if (!entityType || isLoading) {
    return <VitalsLoader />;
  }

  const View = VITALS_VIEWS[entityType];
  if (!View) {
    return null;
  }

  return (
    <Container maxWidth="xl">
      <View vitals={vitals} />
    </Container>
  );
};
