/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiDivider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { useUrlParams } from '../utils';
import { useVitalsData } from '../api';
import { EntityVitalsItem, PartnerLogo } from '../components';

const Wrapper = styled.section`
  min-height: 50vh;
  background: #fbfbfb;
`;

const Container = styled(MuiContainer)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-right: 0;
`;

const FlexRow = styled.div`
  display: flex;
  justify-content: flex-start;
  alignitems: center;
  flex-wrap: wrap;
  height: 100%;
`;

const VitalsSection = styled(FlexRow)`
  flex: 1;
`;

const PartnersContainer = styled(FlexRow)`
  width: 320px;
  padding-left: 25px;
`;

const ParentDistrict = styled(FlexRow)`
  width: 60%;
`;

const ParentVillage = styled(FlexRow)`
  padding-left: 30px;
  width: 30%;
`;

const TitleContainer = styled.div`
  width: 100%;
`;

const RedTitle = styled(Typography)`
  color: ${props => props.theme.palette.primary.main};
  padding-top: 50px;
`;

const GreyTitle = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-weight: bold;
  padding-top: 30px;
  padding-left: 5px;
`;

const HorizontalDivider = styled(MuiDivider)`
  width: 90%;
  margin-top: 1.5rem;
  background: ${props => props.theme.palette.text.tertiary};
`;

const VerticalDivider = styled(MuiDivider)`
  margin-top: 2.5rem;
  margin-right: 2rem;
  height: 7rem;
  background: ${props => props.theme.palette.text.tertiary};
`;

const PlaceholderBox = styled.div`
  width: 510px;
  height: 370px;
  background: grey;
`;
const MapPlaceholder = () => (
  <PlaceholderBox>
    <Typography>TODO: Map</Typography>
  </PlaceholderBox>
);

const CountryView = ({ vitals }) => {
  return (
    <Container maxWidth={false}>
      <VitalsSection>
        <TitleContainer>
          <RedTitle variant="h4">Country Profile:</RedTitle>
        </TitleContainer>
        <EntityVitalsItem
          name="No. Schools"
          value={vitals.NumberOfSchools}
          icon="School"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="No. Students"
          value={vitals.NumberOfStudents}
          icon="Study"
          isLoading={vitals.isLoading}
        />
      </VitalsSection>
      <MapPlaceholder />
      <PartnersContainer>
        <TitleContainer>
          <GreyTitle>Development Partner Support</GreyTitle>
        </TitleContainer>
        {Object.entries(vitals).map(([key, value]) =>
          value === true ? <PartnerLogo code={key} key={key} /> : null,
        )}
      </PartnersContainer>
    </Container>
  );
};

const ProvinceView = ({ vitals }) => {
  return (
    <Container maxWidth={false}>
      <VitalsSection>
        <TitleContainer>
          <RedTitle variant="h4">Province Profile:</RedTitle>
        </TitleContainer>
        <EntityVitalsItem
          name="Province Code"
          value={vitals.code}
          icon="LocationPin"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="Province Population"
          value={vitals.Population}
          icon="Group"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="No. Schools"
          value={vitals.NumberOfSchools}
          icon="School"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="No. Students"
          value={vitals.NumberOfStudents}
          icon="Study"
          isLoading={vitals.isLoading}
        />
      </VitalsSection>
      <MapPlaceholder />
      <PartnersContainer>
        <TitleContainer>
          <GreyTitle>Development Partner Support</GreyTitle>
        </TitleContainer>
        {Object.entries(vitals).map(([key, value]) =>
          value === true ? <PartnerLogo code={key} key={key} /> : null,
        )}
      </PartnersContainer>
    </Container>
  );
};

const DistrictView = ({ vitals }) => {
  return (
    <Container maxWidth={false}>
      <VitalsSection>
        <TitleContainer>
          <RedTitle variant="h4">District Profile:</RedTitle>
        </TitleContainer>
        <EntityVitalsItem
          name="District Code"
          value={vitals.code}
          icon="LocationPin"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="District Population"
          value={vitals.Population}
          icon="Group"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="Priority District"
          value={vitals.priorityDistrict ? 'Yes' : 'No'}
          icon="Notepad"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="No. Schools"
          value={vitals.NumberOfSchools}
          icon="School"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="No. Students"
          value={vitals.NumberOfStudents}
          icon="Study"
          isLoading={vitals.isLoading}
        />
        <HorizontalDivider />
        <FlexRow>
          <TitleContainer>
            <RedTitle variant="h4">Province</RedTitle>
          </TitleContainer>
          <EntityVitalsItem
            name="Province Code"
            value={vitals.parentProvince?.code}
            isLoading={vitals.isLoading}
          />
          <EntityVitalsItem
            name="Province Population"
            value={vitals.parentProvince?.Population}
            isLoading={vitals.isLoading}
          />
        </FlexRow>
      </VitalsSection>
      <MapPlaceholder />
      <PartnersContainer>
        <TitleContainer>
          <GreyTitle>Development Partner Support</GreyTitle>
        </TitleContainer>
        {Object.entries(vitals).map(([key, value]) =>
          value === true ? <PartnerLogo code={key} key={key} /> : null,
        )}
      </PartnersContainer>
    </Container>
  );
};

const VillageView = ({ vitals }) => {
  return (
    <Container maxWidth={false}>
      <VitalsSection>
        <TitleContainer>
          <RedTitle variant="h4">Village Profile:</RedTitle>
        </TitleContainer>
        <EntityVitalsItem
          name="Village Code"
          value={vitals.code}
          icon="LocationPin"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="Village Population"
          value={vitals.Population}
          icon="Group"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="No. Schools"
          value={vitals.NumberOfSchools}
          icon="School"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="No. Students"
          value={vitals.NumberOfStudents}
          icon="Study"
          isLoading={vitals.isLoading}
        />
      </VitalsSection>
      <MapPlaceholder />
      <PartnersContainer>
        <TitleContainer>
          <GreyTitle>Development Partner Support</GreyTitle>
        </TitleContainer>
        {Object.entries(vitals).map(([key, value]) =>
          value === true ? <PartnerLogo code={key} key={key} /> : null,
        )}
      </PartnersContainer>
    </Container>
  );
};

const SchoolView = ({ vitals }) => {
  return (
    <Container maxWidth={false}>
      <VitalsSection>
        <TitleContainer>
          <RedTitle variant="h4">School Profile:</RedTitle>
        </TitleContainer>
        <EntityVitalsItem
          name="School Code"
          value={vitals.code}
          icon="LocationPin"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="Number of Students"
          value={vitals.NumberOfStudents}
          icon="Study"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="Completed School"
          value="Yes"
          icon="Notepad"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="Distance to Main Road"
          value={vitals.DistanceToMainRoad}
          icon="Road"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="Location"
          value={vitals.point.map(x => x.toFixed(3)).join()}
          icon="PushPin"
          isLoading={vitals.isLoading}
        />
        <HorizontalDivider />
        <FlexRow>
          <ParentDistrict>
            <TitleContainer>
              <RedTitle variant="h4">District:</RedTitle>
            </TitleContainer>
            <EntityVitalsItem
              name="District Code"
              value={vitals.parentDistrict?.code}
              isLoading={vitals.isLoading}
            />
            <EntityVitalsItem
              name="District Population"
              value={vitals.parentDistrict?.Population}
              isLoading={vitals.isLoading}
            />
            <EntityVitalsItem
              name="Priority District"
              value={vitals.parentDistrict?.priorityDistrict ? 'Yes' : 'No'}
              isLoading={vitals.isLoading}
            />
          </ParentDistrict>
          <VerticalDivider orientation="vertical" />
          <ParentVillage>
            <TitleContainer>
              <RedTitle variant="h4">Village:</RedTitle>
            </TitleContainer>
            <EntityVitalsItem
              name="Village Population"
              value={vitals.parentVillage?.Population}
              isLoading={vitals.isLoading}
            />
          </ParentVillage>
        </FlexRow>
      </VitalsSection>
      {vitals.Photo ? <img src={vitals.Photo} alt="place" width="720px" /> : <MapPlaceholder />}
    </Container>
  );
};

export const DashboardView = () => {
  const { entityCode } = useUrlParams();
  const vitals = useVitalsData(entityCode);

  return (
    <Wrapper>
      {(() => {
        switch (vitals.type) {
          case 'country':
            return <CountryView vitals={vitals} />;
          case 'district':
            return <ProvinceView vitals={vitals} />;
          case 'sub_district':
            return <DistrictView vitals={vitals} />;
          case 'village':
            return <VillageView vitals={vitals} />;
          case 'school':
            return <SchoolView vitals={vitals} />;
          default:
            return null;
        }
      })()}
    </Wrapper>
  );
};

CountryView.propTypes = {
  vitals: PropTypes.object.isRequired,
};
ProvinceView.propTypes = {
  vitals: PropTypes.object.isRequired,
};
DistrictView.propTypes = {
  vitals: PropTypes.object.isRequired,
};
VillageView.propTypes = {
  vitals: PropTypes.object.isRequired,
};
SchoolView.propTypes = {
  vitals: PropTypes.object.isRequired,
};
