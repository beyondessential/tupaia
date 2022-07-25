import React from 'react';
import styled from 'styled-components';

import { useEntityData, useVitalsData } from '../../../api';
import { useUrlParams } from '../../../utils';
import { VITALS_VIEWS } from '../../../views/VitalsView';
import { VitalsLoader } from '../../VitalsLoader';

const Container = styled.div`
  text-align: start;
  padding: 50px;
`;

export const EntityDetails = () => {
  const { entityCode } = useUrlParams();
  const { data: entityData = {} } = useEntityData(entityCode);
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
    <Container>
      <View vitals={vitals} variant="h2" />
    </Container>
  );
};
