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
import MuiBox from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import { EntityVitalsItem, FlexStart, MiniMap } from '../components';
import { PARTNERS_LOGOS } from '../constants';
import { useVitalsData } from '../api/queries';
import { useUrlParams } from '../utils';

const PartnersContainer = styled.div`
  background: white;
  padding-top: 32px;
  margin-right: -24px;
  margin-left: -15px;
  padding-left: 30px;

  ${props => props.theme.breakpoints.down('sm')} {
    background: none;
    margin-right: 0;
    margin-left: 0;
    padding-left: 0;
  }
`;

const PartnersTitle = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 140%;
`;

const LogoWrapper = styled.div`
  margin: 5px;
  width: 55px;
  height: 55px;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 5px;
  padding: 3px;
`;

const Logo = styled.div`
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  width: 100%;
  height: 100%;
`;

const PartnersSection = ({ vitals, displayAll }) => {
  const sponsorsList = displayAll
    ? Object.entries(PARTNERS_LOGOS)
    : Object.entries(vitals).filter(([key, value]) => {
        return Object.keys(PARTNERS_LOGOS).includes(key) && value === true;
      });
  return (
    <PartnersContainer>
      <PartnersTitle>Development Partner Support</PartnersTitle>
      <FlexStart flexWrap="wrap" pt={1} mb={4}>
        {sponsorsList.map(([code]) => (
          <LogoWrapper key={code}>
            <Logo
              style={{ backgroundImage: `url('/images/partnerLogos/${PARTNERS_LOGOS[code]}')` }}
            />
          </LogoWrapper>
        ))}
      </FlexStart>
    </PartnersContainer>
  );
};

PartnersSection.propTypes = {
  vitals: PropTypes.object.isRequired,
  displayAll: PropTypes.bool,
};

PartnersSection.defaultProps = {
  displayAll: false,
};

const SitePhoto = styled.div`
  background-position: top left;
  background-size: cover;
  background-repeat: no-repeat;
  max-width: 100%;
`;

const PhotoOrMap = ({ Photo, code }) => {
  if (Photo) {
    return <SitePhoto style={{ backgroundImage: `url('${Photo}')` }} />;
  }

  return <MiniMap entityCode={code} />;
};

PhotoOrMap.propTypes = {
  Photo: PropTypes.string,
  code: PropTypes.string,
};

PhotoOrMap.defaultProps = {
  Photo: null,
  code: null,
};

const Heading = styled(Typography)`
  font-weight: 600;
  font-size: 18px;
  line-height: 140%;
  text-transform: capitalize;
  color: ${props => props.theme.palette.primary.main};
`;

const SubHeading = styled(Heading)`
  font-weight: 500;
  font-size: 16px;
`;

const HorizontalDivider = styled(MuiDivider)`
  margin-right: 1rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1.1fr;
  column-gap: 15px;
  row-gap: 30px;
  padding-top: 1rem;
`;

const ThreeColGrid = styled(TwoColGrid)`
  grid-template-columns: 1.2fr 1.1fr 1fr;
`;

const VitalsContainer = styled.div`
  padding-top: 30px;
  padding-bottom: 30px;
`;

/* eslint-disable react/prop-types */
// Vitals data is essentially unstructured so no point checking prop types

const CountryView = () => (
  <VitalsContainer>
    <Heading variant="h4">Country Profile:</Heading>
    <TwoColGrid>
      <EntityVitalsItem
        name="No. Schools"
        value="13,849" // TODO: Remove hardcoded values https://github.com/beyondessential/tupaia-backlog/issues/2765
        icon="School"
      />
      <EntityVitalsItem
        name="No. Students"
        value="1,659,117" // TODO: Remove hardcoded values https://github.com/beyondessential/tupaia-backlog/issues/2765
        icon="Study"
      />
    </TwoColGrid>
  </VitalsContainer>
);

const ProvinceView = ({ vitals }) => (
  <VitalsContainer>
    <Heading variant="h4">Province Profile:</Heading>
    <ThreeColGrid>
      <EntityVitalsItem name="Province Code" value={vitals.code} icon="LocationPin" />
      <EntityVitalsItem
        name="Province Population"
        value={vitals.Population?.toLocaleString()}
        icon="Group"
      />
      <EntityVitalsItem
        name="No. Schools"
        value={vitals.NumberOfSchools?.toLocaleString()}
        icon="School"
      />
      <EntityVitalsItem
        name="No. Students"
        value={vitals.NumberOfStudents?.toLocaleString()}
        icon="Study"
      />
    </ThreeColGrid>
  </VitalsContainer>
);

const DistrictView = ({ vitals }) => (
  <VitalsContainer>
    <Heading variant="h4">District Profile:</Heading>
    <ThreeColGrid>
      <EntityVitalsItem name="District Code" value={vitals.code} icon="LocationPin" />
      <EntityVitalsItem
        name="District Population"
        value={vitals.Population?.toLocaleString()}
        icon="Group"
      />
      <EntityVitalsItem
        name="Priority District"
        value={vitals.priorityDistrict ? 'Yes' : 'No'}
        icon="Notepad"
      />
      <EntityVitalsItem
        name="No. Schools"
        value={vitals.NumberOfSchools?.toLocaleString()}
        icon="School"
      />
      <EntityVitalsItem
        name="No. Students"
        value={vitals.NumberOfStudents?.toLocaleString()}
        icon="Study"
      />
    </ThreeColGrid>
    <HorizontalDivider />
    <MuiBox mt={2}>
      <SubHeading variant="h4">{vitals.parentProvince?.name} Province</SubHeading>
      <FlexStart mt={1} mb={4}>
        <EntityVitalsItem name="Province Code" value={vitals.parentProvince?.code} mr={4} />
        <EntityVitalsItem
          name="Province Population"
          value={vitals.parentProvince?.Population?.toLocaleString()}
        />
      </FlexStart>
    </MuiBox>
  </VitalsContainer>
);

const SchoolView = ({ vitals }) => (
  <VitalsContainer>
    <Heading variant="h4">School Profile:</Heading>
    <ThreeColGrid>
      <EntityVitalsItem name="School Code" value={vitals.code} icon="LocationPin" />
      <EntityVitalsItem
        name="Number of Students"
        value={vitals.NumberOfStudents?.toLocaleString()}
        icon="Study"
      />
      <EntityVitalsItem name="Complete School" icon="Notepad" isLoading={vitals.isLoading} />
      <EntityVitalsItem
        name="Distance to Main Road"
        value={vitals.DistanceToMainRoad ? `${vitals.DistanceToMainRoad} km` : '-'}
        icon="Road"
      />
      <EntityVitalsItem
        name="Location"
        value={vitals.point?.map(x => x.toFixed(3)).join(', ')}
        icon="PushPin"
      />
      <EntityVitalsItem name="School Type" value={vitals.attributes?.type} icon="School" />
    </ThreeColGrid>
    <HorizontalDivider />
    <MuiBox mt={2}>
      <SubHeading variant="h4">{vitals.parentDistrict?.name}</SubHeading>
      <FlexStart mt={1} mb={4}>
        <EntityVitalsItem
          name="District Population"
          value={vitals.parentDistrict?.Population?.toLocaleString()}
          mr={4}
        />
        <EntityVitalsItem
          name="Priority District"
          value={vitals.parentDistrict?.priorityDistrict ? 'Yes' : 'No'}
        />
      </FlexStart>
    </MuiBox>
  </VitalsContainer>
);

const Wrapper = styled.section`
  background: #fbfbfb;
`;

const Container = styled(MuiContainer)`
  display: grid;
  grid-template-columns: minmax(580px, 2.5fr) 2fr 1fr;
  column-gap: 15px;
  row-gap: 15px;

  ${props => props.theme.breakpoints.down('sm')} {
    display: block;
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 10px;
  row-gap: 15px;
  padding-right: 1rem;
  padding-top: 0.6rem;
`;

const Loader = () => (
  <Wrapper>
    <MuiContainer maxWidth="xl">
      <MuiBox display="flex" alignItems="flex-start" justifyContent="flex-start">
        <MuiBox pt={5}>
          <Skeleton width={220} height={24} />
          <LoadingGrid>
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
          </LoadingGrid>
        </MuiBox>
        <Skeleton width={400} height={350} variant="rect" />
      </MuiBox>
    </MuiContainer>
  </Wrapper>
);

const VITALS_VIEWS = {
  country: CountryView,
  district: ProvinceView,
  sub_district: DistrictView,
  school: SchoolView,
};

export const VitalsView = ({ entityType }) => {
  const { entityCode } = useUrlParams();
  const { data: vitals, isLoading } = useVitalsData(entityCode);
  const View = VITALS_VIEWS[entityType];

  if (!entityType || isLoading) {
    return <Loader />;
  }

  if (!View) {
    return null;
  }

  return (
    <Wrapper>
      <Container maxWidth="xl">
        <View vitals={vitals} />
        <PhotoOrMap {...vitals} />
        <PartnersSection vitals={vitals} />
      </Container>
    </Wrapper>
  );
};

VitalsView.propTypes = {
  entityType: PropTypes.string,
};

VitalsView.defaultProps = {
  entityType: null,
};
