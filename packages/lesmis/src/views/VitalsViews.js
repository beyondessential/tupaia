import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiDivider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { EntityVitalsItem, FlexStart, MiniMap } from '../components';
import { PARTNERS_LOGOS } from '../constants';

const VitalsSection = styled(FlexStart)`
  margin-right: 10px;
  padding-bottom: 1rem;
  flex: 1;
  min-width: 500px;
  height: 100%;
`;

const PartnersContainer = styled(FlexStart)`
  width: 320px;
  padding-left: 25px;
  height: 100%;
`;

const TitleContainer = styled.div`
  width: 100%;
`;

const RedTitle = styled(Typography)`
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

// eslint-disable-next-line react/prop-types
const PartnersSection = ({ vitals }) => {
  const logosCodes = vitals.filter(vital => Object.keys(PARTNERS_LOGOS).includes(vital));
  return (
    <PartnersContainer>
      <TitleContainer>
        <GreyTitle>Development Partner Support</GreyTitle>
      </TitleContainer>
      {logosCodes.map(code => (
        <StyledLogo key={code} code={PARTNERS_LOGOS[code]} />
      ))}
    </PartnersContainer>
  );
};

// eslint-disable-next-line react/prop-types
const PhotoOrMap = ({ vitals }) => {
  const [validImage, setValidImage] = useState(true);
  if (vitals.isLoading) return null;

  if (vitals.Photo && validImage)
    return (
      <img src={vitals.Photo} alt="place" width="720px" onError={() => setValidImage(false)} />
    );

  return <MiniMap entityCode={vitals.code} />;
};

export const CountryView = ({ vitals }) => {
  return (
    <>
      <VitalsSection>
        <TitleContainer>
          <RedTitle variant="h4">Country Profile:</RedTitle>
        </TitleContainer>
        <EntityVitalsItem
          name="No. Schools"
          value="13849" // TODO: Remove hardcoded values https://github.com/beyondessential/tupaia-backlog/issues/2765
          icon="School"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="No. Students"
          value="1659117" // TODO: Remove hardcoded values https://github.com/beyondessential/tupaia-backlog/issues/2765
          icon="Study"
          isLoading={vitals.isLoading}
        />
      </VitalsSection>
      <PhotoOrMap vitals={vitals} />
      <PartnersSection vitals={vitals} />
    </>
  );
};

export const ProvinceView = ({ vitals }) => {
  return (
    <>
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
      <PhotoOrMap vitals={vitals} />
      <PartnersSection vitals={vitals} />
    </>
  );
};

export const DistrictView = ({ vitals }) => {
  return (
    <>
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
        <FlexStart>
          <TitleContainer>
            <RedTitle variant="h4">Province</RedTitle>
          </TitleContainer>
          <EntityVitalsItem
            name="Name of Province"
            value={vitals.parentProvince?.name}
            isLoading={vitals.isLoading}
          />
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
        </FlexStart>
      </VitalsSection>
      <PhotoOrMap vitals={vitals} />
      <PartnersSection vitals={vitals} />
    </>
  );
};

export const SchoolView = ({ vitals }) => {
  return (
    <>
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
        <EntityVitalsItem name="Complete School" icon="Notepad" isLoading={vitals.isLoading} />
        <EntityVitalsItem
          name="Distance to Main Road"
          value={`${vitals.DistanceToMainRoad || '-'} km`}
          icon="Road"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="Location"
          value={vitals.point?.map(x => x.toFixed(3)).join()}
          icon="PushPin"
          isLoading={vitals.isLoading}
        />
        <EntityVitalsItem
          name="School Type"
          value={vitals.attributes?.type}
          icon="School"
          isLoading={vitals.isLoading}
        />
        <HorizontalDivider />
        <FlexStart>
          <TitleContainer>
            <RedTitle variant="h4">District</RedTitle>
          </TitleContainer>
          <EntityVitalsItem
            name="Name of District"
            value={vitals.parentDistrict?.name}
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
        </FlexStart>
      </VitalsSection>
      <PhotoOrMap vitals={vitals} />
    </>
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
SchoolView.propTypes = {
  vitals: PropTypes.object.isRequired,
};
