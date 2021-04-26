/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { useUrlParams } from '../utils';
import { useVitalsData } from '../api';
import { EntityVitalsItem, getPartnerSupportItems } from '../components';

const Wrapper = styled.section`
  min-height: 50vh;
  background: #fbfbfb;
`;

const Container = styled(MuiContainer)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const FlexRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  height: 100%;
`;

const TitleContainer = styled.div`
  width: 100%;
`;

const RedTitle = styled(Typography)`
  color: ${props => props.theme.palette.primary.main};
  padding-top: 50px;
`;

export const DashboardView = () => {
  const { entityCode } = useUrlParams();
  const vitals = useVitalsData(entityCode);
  switch (vitals.type) {
    case 'district':
      // "Province" in lesmis context
      return (
        <Wrapper>
          <Container maxWidth={false}>
            <FlexRow>
              <TitleContainer>
                <RedTitle variant="h4">Province Profile:</RedTitle>
              </TitleContainer>
              <EntityVitalsItem name="Province Code" value={vitals.code} icon="LocationPin" />
              <EntityVitalsItem name="Province Population" value={vitals.Population} icon="Group" />
              <EntityVitalsItem name="No. Schools" value={vitals.NumberOfSchools} icon="School" />
              <EntityVitalsItem name="No. Students" value={vitals.NumberOfStudents} icon="Study" />
            </FlexRow>
            <img src="/images/school.png" alt="place" />
            <FlexRow>
              <TitleContainer>
                <Typography>Development Partner Support</Typography>
              </TitleContainer>
              {getPartnerSupportItems(vitals)}
            </FlexRow>
          </Container>
        </Wrapper>
      );
    case 'sub_district':
      // "District" in lesmis context
      return (
        <Wrapper>
          <Container>
            <FlexRow>
              <TitleContainer>
                <RedTitle variant="h4">District Profile:</RedTitle>
              </TitleContainer>
              <EntityVitalsItem name="District Code" value={vitals.code} icon="LocationPin" />
              <EntityVitalsItem name="District Population" value={vitals.Population} icon="Group" />
              <EntityVitalsItem
                name="Priority District"
                value={vitals.priorityDistrict ? 'Yes' : 'No'}
                icon="Notepad"
              />
              <EntityVitalsItem name="No. Schools" value={vitals.NumberOfSchools} icon="School" />
              <EntityVitalsItem name="No. Students" value={vitals.NumberOfStudents} icon="Study" />
            </FlexRow>
            <img src="/images/school.png" alt="place" />
            <FlexRow>
              <TitleContainer>
                <Typography>Development Partner Support</Typography>
              </TitleContainer>
              {getPartnerSupportItems(vitals)}
            </FlexRow>
          </Container>
        </Wrapper>
      );
    case 'school':
      return (
        <Wrapper>
          <Container maxWidth={false}>
            <FlexRow>
              <TitleContainer>
                <RedTitle variant="h4">School Profile:</RedTitle>
              </TitleContainer>
              <EntityVitalsItem name="School Code" value={vitals.code} icon="LocationPin" />
              <EntityVitalsItem
                name="Number of Students"
                value={vitals.NumberOfStudents}
                icon="Study"
              />
              <EntityVitalsItem name="Completed School" value="Yes" icon="Notepad" />
              <EntityVitalsItem
                name="Distance to Main Road"
                value={vitals.DistanceToMainRoad}
                icon="Road"
              />
              <EntityVitalsItem
                name="Location"
                value={vitals.point.map(x => x.toFixed(3)).join()}
                icon="PushPin"
              />
            </FlexRow>
            <img src="/images/school.png" alt="place" />
          </Container>
        </Wrapper>
      );
    default:
      return (
        <Wrapper>
          <MuiContainer>
            <Typography>Dashboard View</Typography>
          </MuiContainer>
        </Wrapper>
      );
  }
};
