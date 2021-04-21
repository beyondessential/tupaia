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
import { EntityVitalsItem } from '../components';

const Wrapper = styled.section`
  padding: 0, 0, 0, 0;
  min-height: 50vh;
  background: #fbfbfb;
`;

const Container = styled(MuiContainer)`
  margin-left: 0;
  padding: 0, 0, 0, 0;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
`;

const WrapContainer = styled(MuiContainer)`
  padding-top: 0.5rem;
  padding-left: 0;
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  height: 100%;
`;

const TitleContainer = styled(MuiContainer)`
  margin-left: 0;
  padding-left: 0;
  width: 100%;
`;

const RedTitle = styled(Typography)`
  color: ${props => props.theme.palette.primary.main};
`;

export const DashboardView = () => {
  const { entityCode } = useUrlParams();
  const vitals = useVitalsData(entityCode);
  switch (vitals.type) {
    case 'district':
      // "Province" in lesmis context
      return (
        <Wrapper>
          <Container>
            <WrapContainer>
              <TitleContainer>
                <RedTitle variant="h4">Province Profile:</RedTitle>
              </TitleContainer>
              <EntityVitalsItem name="Province Code" value={vitals.code} icon="PinDrop" />
              <EntityVitalsItem
                name="Province Population"
                value={vitals.Population}
                icon="People"
              />
              <EntityVitalsItem name="No. Schools" value={vitals.NumberOfSchools} icon="School" />
              <EntityVitalsItem
                name="No. Students"
                value={vitals.NumberOfStudents}
                icon="LocalLibrary"
              />
            </WrapContainer>
            <img src="/images/school.png" alt="place" />
            <WrapContainer>
              <Typography>Development Partner Support</Typography>
            </WrapContainer>
          </Container>
        </Wrapper>
      );
    case 'sub_district':
      // "District" in lesmis context
      return (
        <Wrapper>
          <Container>
            <WrapContainer>
              <TitleContainer>
                <RedTitle variant="h4">District Profile:</RedTitle>
              </TitleContainer>
              <EntityVitalsItem name="District Code" value={vitals.code} icon="PinDrop" />
              <EntityVitalsItem
                name="District Population"
                value={vitals.Population}
                icon="People"
              />
              <EntityVitalsItem
                name="Priority District"
                value={vitals.priorityDistrict ? 'Yes' : 'No'}
                icon="Assignment"
              />
              <EntityVitalsItem name="No. Schools" value={vitals.NumberOfSchools} icon="School" />
              <EntityVitalsItem
                name="No. Students"
                value={vitals.NumberOfStudents}
                icon="LocalLibrary"
              />
            </WrapContainer>
            <img src="/images/school.png" alt="place" />
            <WrapContainer>
              <Typography>Development Partner Support</Typography>
            </WrapContainer>
          </Container>
        </Wrapper>
      );
    case 'school':
      return (
        <Wrapper>
          <Container>
            <WrapContainer>
              <TitleContainer>
                <RedTitle variant="h4">School Profile:</RedTitle>
              </TitleContainer>
              <EntityVitalsItem name="School Code" value={vitals.code} icon="PinDrop" />
              <EntityVitalsItem
                name="Number of Students"
                value={vitals.NumberOfStudents}
                icon="LocalLibrary"
              />
              <EntityVitalsItem name="Completed School" value="Yes" icon="Assignment" />
              <EntityVitalsItem
                name="Distance to Main Road"
                value={vitals.DistanceToMainRoad}
                icon="Map"
              />
              <EntityVitalsItem name="Location" value={vitals.point} icon="LocationOn" />
            </WrapContainer>
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

// <Typography>${JSON.stringify(vitals)}</Typography>
