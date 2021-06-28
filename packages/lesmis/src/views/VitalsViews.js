/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiDivider from '@material-ui/core/Divider';
import MuiBox from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { EntityVitalsItem, FlexStart, MiniMap } from '../components';
import { PARTNERS_LOGOS } from '../constants';
import { useVitalsData } from '../api/queries';
import Skeleton from '@material-ui/lab/Skeleton';

/* eslint-disable react/prop-types */

const PartnersContainer = styled(FlexStart)`
  width: 320px;
  padding-left: 25px;
  height: 100%;
`;

const PartnersSection = ({ vitals }) => {
  const sponsorsList = Object.entries(vitals).filter(
    ([key, value]) => Object.keys(PARTNERS_LOGOS).includes(key) && value === true,
  );
  return (
    <PartnersContainer>
      <GreyTitle>Development Partner Support</GreyTitle>
      {sponsorsList.map(code => (
        <StyledLogo
          key={code}
          style={{ backgroundImage: `url('/images/partnerLogos/${PARTNERS_LOGOS[code]}')` }}
        />
      ))}
    </PartnersContainer>
  );
};

const PhotoOrMap = ({ vitals }) => {
  const [validImage, setValidImage] = useState(true);
  if (vitals.isLoading) return null;

  if (vitals.Photo && validImage)
    return (
      <img src={vitals.Photo} alt="place" width="720px" onError={() => setValidImage(false)} />
    );

  return <MiniMap entityCode={vitals.code} />;
};

const VitalsSection = styled.div`
  padding: 30px 30px 30px 0;
  flex: 1;
  min-width: 500px;
`;

const Title = styled(Typography)`
  font-weight: 500;
  text-transform: capitalize;
  color: ${props => props.theme.palette.primary.main};
  padding-top: 30px;
`;

const GreyTitle = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-weight: 500;
  padding-top: 30px;
  padding-bottom: 10px;
  padding-left: 5px;
`;

const HorizontalDivider = styled(MuiDivider)`
  width: 90%;
  margin-top: 1rem;
`;

const StyledLogo = styled.div`
  margin: 5px;
  width: 55px;
  height: 55px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 5px;
`;

const CountryView = ({ vitals }) => (
  <>
    <VitalsSection>
      <Title variant="h4">Country Profile:</Title>
      <FlexStart flexWrap="wrap">
        <EntityVitalsItem
          name="No. Schools"
          value="13849" // TODO: Remove hardcoded values https://github.com/beyondessential/tupaia-backlog/issues/2765
          icon="School"
        />
        <EntityVitalsItem
          name="No. Students"
          value="1659117" // TODO: Remove hardcoded values https://github.com/beyondessential/tupaia-backlog/issues/2765
          icon="Study"
        />
      </FlexStart>
    </VitalsSection>
    <PhotoOrMap vitals={vitals} />
    <PartnersSection vitals={vitals} />
  </>
);

const ProvinceView = ({ vitals }) => (
  <>
    <VitalsSection>
      <Title variant="h4">Province Profile:</Title>
      <FlexStart flexWrap="wrap">
        <EntityVitalsItem name="Province Code" value={vitals.code} icon="LocationPin" />
        <EntityVitalsItem name="Province Population" value={vitals.Population} icon="Group" />
        <EntityVitalsItem name="No. Schools" value={vitals.NumberOfSchools} icon="School" />
        <EntityVitalsItem name="No. Students" value={vitals.NumberOfStudents} icon="Study" />
      </FlexStart>
    </VitalsSection>
    <PhotoOrMap vitals={vitals} />
    <PartnersSection vitals={vitals} />
  </>
);

const DistrictView = ({ vitals }) => (
  <>
    <VitalsSection>
      <Title variant="h4">District Profile:</Title>
      <FlexStart flexWrap="wrap">
        <EntityVitalsItem name="District Code" value={vitals.code} icon="LocationPin" />
        <EntityVitalsItem name="District Population" value={vitals.Population} icon="Group" />
        <EntityVitalsItem
          name="Priority District"
          value={vitals.priorityDistrict ? 'Yes' : 'No'}
          icon="Notepad"
        />
        <EntityVitalsItem name="No. Schools" value={vitals.NumberOfSchools} icon="School" />
        <EntityVitalsItem name="No. Students" value={vitals.NumberOfStudents} icon="Study" />
      </FlexStart>
      <HorizontalDivider />
      <FlexStart>
        <Title variant="h4">Province</Title>
        <EntityVitalsItem name="Name of Province" value={vitals.parentProvince?.name} />
        <EntityVitalsItem name="Province Code" value={vitals.parentProvince?.code} />
        <EntityVitalsItem name="Province Population" value={vitals.parentProvince?.Population} />
      </FlexStart>
    </VitalsSection>
    <PhotoOrMap vitals={vitals} />
    <PartnersSection vitals={vitals} />
  </>
);

const SchoolView = ({ vitals }) => (
  <>
    <VitalsSection>
      <Title variant="h4">School Profile:</Title>
      <EntityVitalsItem name="School Code" value={vitals.code} icon="LocationPin" />
      <EntityVitalsItem name="Number of Students" value={vitals.NumberOfStudents} icon="Study" />
      <EntityVitalsItem name="Complete School" icon="Notepad" isLoading={vitals.isLoading} />
      <EntityVitalsItem
        name="Distance to Main Road"
        value={`${vitals.DistanceToMainRoad || '-'} km`}
        icon="Road"
      />
      <EntityVitalsItem
        name="Location"
        value={vitals.point?.map(x => x.toFixed(3)).join()}
        icon="PushPin"
      />
      <EntityVitalsItem name="School Type" value={vitals.attributes?.type} icon="School" />
      <HorizontalDivider />
      <FlexStart>
        <Title variant="h4">District</Title>
        <EntityVitalsItem name="Name of District" value={vitals.parentDistrict?.name} />
        <EntityVitalsItem name="District Population" value={vitals.parentDistrict?.Population} />
        <EntityVitalsItem
          name="Priority District"
          value={vitals.parentDistrict?.priorityDistrict ? 'Yes' : 'No'}
        />
      </FlexStart>
    </VitalsSection>
    <PhotoOrMap vitals={vitals} />
  </>
);

const Wrapper = styled.section`
  background: #fbfbfb;
`;

const Container = styled(MuiContainer)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 80px 80px 80px;
  column-gap: 10px;
  row-gap: 15px;
  padding-right: 1rem;
  padding-top: 0.6rem;
`;

const Loader = () => {
  return (
    <MuiBox display="flex" alignItems="flex-start">
      <MuiBox pt={5}>
        <Skeleton width={220} height={24} />
        <Grid>
          <EntityVitalsItem isLoading />
          <EntityVitalsItem isLoading />
          <EntityVitalsItem isLoading />
          <EntityVitalsItem isLoading />
          <EntityVitalsItem isLoading />
          <EntityVitalsItem isLoading />
        </Grid>
      </MuiBox>
      <Skeleton width={500} height={350} variant="rect" />
      <MuiBox height={350} />
    </MuiBox>
  );
};

const VITALS_VIEWS = {
  country: CountryView,
  district: ProvinceView,
  sub_district: DistrictView,
  school: SchoolView,
};

export const VitalsView = ({ entityCode, entityType }) => {
  const { data, isLoading } = useVitalsData(entityCode);
  const View = VITALS_VIEWS[entityType];

  return (
    <Wrapper>
      <Container maxWidth="xl">
        {!entityType || isLoading ? <Loader /> : <View vitals={data} />}
      </Container>
    </Wrapper>
  );
};
