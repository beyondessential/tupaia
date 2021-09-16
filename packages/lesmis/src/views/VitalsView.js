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
import { EntityVitalsItem, FlexStart, MiniMap, VitalsLoader } from '../components';
import { useVitalsData } from '../api/queries';
import { useUrlParams } from '../utils';

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
    <Heading variant="h4">Country Details</Heading>
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
    <Heading variant="h4">Province Details</Heading>
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
    <Heading variant="h4">District Details</Heading>
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
      <SubHeading variant="h4">Province Details</SubHeading>
      <FlexStart mt={1} mb={4}>
        <EntityVitalsItem name="Name of Province" value={vitals.parentProvince?.name} mr={4} />
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
    <Heading variant="h4">School Details</Heading>
    <ThreeColGrid>
      <EntityVitalsItem name="School Code" value={vitals.code} icon="LocationPin" />
      <EntityVitalsItem
        name="Number of Students"
        value={vitals.NumberOfStudents?.toLocaleString()}
        icon="Study"
      />
      <EntityVitalsItem name="Complete School" icon="Notepad" />
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
      <SubHeading variant="h4">District Details</SubHeading>
      <FlexStart mt={1} mb={4}>
        <EntityVitalsItem name="Name of District" value={vitals.parentDistrict?.name} mr={4} />
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
  overflow: hidden;
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

const PartnersContainer = styled.div`
  position: relative;
  background: white;
  padding-top: 32px;
  margin-right: -24px;
  margin-left: -15px;
  padding-left: 30px;

  &:after {
    content: '';
    position: absolute;
    background: white;
    top: 0;
    left: 100%;
    bottom: 0;
    width: 1000px;
  }

  ${props => props.theme.breakpoints.down('sm')} {
    background: none;
    margin-right: 0;
    margin-left: 0;
    padding-left: 0;
  }
`;

const SitePhoto = styled.div`
  background-position: top left;
  background-size: cover;
  background-repeat: no-repeat;
  max-width: 100%;
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

const VITALS_VIEWS = {
  country: CountryView,
  district: ProvinceView,
  sub_district: DistrictView,
  school: SchoolView,
};

export const VitalsView = ({ entityType }) => {
  const { entityCode } = useUrlParams();
  const { data: vitals, isLoading } = useVitalsData(entityCode);

  if (!entityType || isLoading) {
    return <VitalsLoader />;
  }

  const View = VITALS_VIEWS[entityType];

  if (!View) {
    return null;
  }

  return (
    <Wrapper>
      <Container maxWidth="xl">
        <View vitals={vitals} />
        {vitals.Photo ? (
          <SitePhoto style={{ backgroundImage: `url('${vitals.Photo}')` }} />
        ) : (
          <MiniMap entityCode={vitals.code} />
        )}
        <PartnersContainer>
          <PartnersTitle>Development Partner Support</PartnersTitle>
          <FlexStart flexWrap="wrap" pt={1} mb={4}>
            {vitals?.partners?.map(image => (
              <LogoWrapper key={image}>
                <Logo style={{ backgroundImage: `url('${[image]}')` }} />
              </LogoWrapper>
            ))}
          </FlexStart>
        </PartnersContainer>
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
