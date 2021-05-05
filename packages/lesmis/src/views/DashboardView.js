/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import MuiContainer from '@material-ui/core/Container';
import MuiDivider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { Select } from '@tupaia/ui-components';
import { DashboardReportTabView } from './DashboardReportTabView';
import { TabPanel, TabBar, TabBarSection, EntityVitalsItem, PartnerLogo } from '../components';
import { useUrlParams } from '../utils';
import { useVitalsData, useEntityData } from '../api/queries';
import * as COLORS from '../constants';

// const TemplateBody = styled.section`
//   background: ${COLORS.GREY_F9};
//   padding-top: 1rem;
//   min-height: 300px;
// `;

const StyledSelect = styled(Select)`
  margin: 0 1rem 0 0;
  width: 14rem;
  text-transform: capitalize;
`;

const TabTemplate = ({ TabSelector, Body }) => (
  <>
    <TabBar>
      <TabBarSection>{TabSelector}</TabBarSection>
    </TabBar>
    <MuiBox p={5} minHeight={500}>
      {Body}
    </MuiBox>
  </>
);

TabTemplate.propTypes = {
  TabSelector: PropTypes.node.isRequired,
  Body: PropTypes.node.isRequired,
};

const makeTabOptions = entityType => [
  {
    value: 'profile',
    label: entityType ? `${entityType} Profile` : 'Profile',
    Component: DashboardReportTabView,
  },
  {
    value: 'indicators',
    label: 'Free Indicator Selection',
    Component: TabTemplate,
    Body: 'Free Indicator Selection',
  },
  {
    value: 'essdpPlan',
    label: 'ESSDP Plan 2021-25 M&E Framework',
    Component: TabTemplate,
    Body: '9th Education Sector and Sports Development Plan 2021-25 M&E Framework',
  },
  {
    value: 'earlyChildhood',
    label: 'ESSDP Early childhood education sub-sector',
    Component: TabTemplate,
    Body: 'ESSDP Early childhood education sub-sector',
  },
  {
    value: 'primary',
    label: 'ESSDP Primary sub-sector',
    Component: TabTemplate,
    Body: 'ESSDP Primary sub-sector',
  },
  {
    value: 'secondary',
    label: 'ESSDP Lower secondary sub-sector',
    Component: TabTemplate,
    Body: 'ESSDP Lower secondary sub-sector',
  },
  {
    value: 'emergency',
    label: 'Emergency in Education/COVID-19',
    Component: TabTemplate,
    Body: 'Emergency in Education/COVID-19',
  },
  {
    value: 'international',
    label: 'International reporting on SDGs',
    Component: TabTemplate,
    Body: 'International reporting on SDGs',
  },
];

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
  align-items: center;
  flex-wrap: wrap;
  height: 100%;
`;

const VitalsSection = styled(FlexRow)`
  margin-right: 10px;
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
    <>
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
    </>
  );
};

const ProvinceView = ({ vitals }) => {
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
      <MapPlaceholder />
      <PartnersContainer>
        <TitleContainer>
          <GreyTitle>Development Partner Support</GreyTitle>
        </TitleContainer>
        {Object.entries(vitals).map(([key, value]) =>
          value === true ? <PartnerLogo code={key} key={key} /> : null,
        )}
      </PartnersContainer>
    </>
  );
};

const DistrictView = ({ vitals }) => {
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
        <FlexRow>
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
    </>
  );
};

const VillageView = ({ vitals }) => {
  return (
    <>
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
    </>
  );
};

const SchoolView = ({ vitals }) => {
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
        <FlexRow>
          <ParentDistrict>
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
          </ParentDistrict>
          <VerticalDivider orientation="vertical" />
          <ParentVillage>
            <TitleContainer>
              <RedTitle variant="h4">Village</RedTitle>
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
    </>
  );
};

export const DashboardView = () => {
  const { entityCode } = useUrlParams();
  const { data: entityData } = useEntityData(entityCode);
  const vitals = useVitalsData(entityCode);

  const tabOptions = makeTabOptions(entityData?.type);

  const [selectedTab, setSelectedTab] = useState(tabOptions[0].value);

  const handleChangeTab = event => {
    setSelectedTab(event.target.value);
  };

  return (
    <>
      <Wrapper>
        <Container maxWidth={false}>
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
        </Container>
      </Wrapper>
      {tabOptions.map(({ value, Body, Component }) => (
        <TabPanel key={value} isSelected={value === selectedTab} Panel={React.Fragment}>
          <Component
            entityCode={entityCode}
            Body={Body}
            TabSelector={
              <StyledSelect
                id="dashboardtab"
                options={tabOptions}
                value={selectedTab}
                onChange={handleChangeTab}
                showPlaceholder={false}
                SelectProps={{
                  MenuProps: { disablePortal: true },
                }}
              />
            }
          />
        </TabPanel>
      ))}
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
VillageView.propTypes = {
  vitals: PropTypes.object.isRequired,
};
SchoolView.propTypes = {
  vitals: PropTypes.object.isRequired,
};
