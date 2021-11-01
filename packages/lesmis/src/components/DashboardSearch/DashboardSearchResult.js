/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { makeEntityLink, useUrlParams } from '../../utils';

const Result = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  background: #f9f9f9;
  border-radius: 3px;
  padding: 30px;
  margin-bottom: 20px;

  .MuiSvgIcon-root {
    color: ${props => props.theme.palette.primary.main};
  }
`;

const Heading = styled(Typography)`
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  color: #2c3236;
`;

const SubHeading = styled(Typography)`
  font-weight: normal;
  font-size: 12px;
  line-height: 14px;
  margin-bottom: 10px;
  color: #d13333;
`;

const Overlay = styled.div`
  &.active {
    background: white;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: auto;
    min-height: 100%;
    z-index: 1;
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding-top: 36px;
`;

const Text = styled(Typography)`
  margin-bottom: 20px;
`;

const testResults = [
  {
    dashboardName: 'Basic Emergency/Disaster Information',
    dashboardId: '60f0c1f661f76a30d700000c',
    dashboardCode: 'LESMIS_EmergencyInEducation_Basic_Information',
    entityType: 'district',
    entityCode: 'LA_Champasack',
    entityName: 'Champasack',
    items: [],
  },
  {
    dashboardName: 'Loss Teaching & Learning Materials',
    dashboardId: '60f0c1f661f76a30d700000e',
    dashboardCode: 'LESMIS_EmergencyInEducation_Teaching_Learning_Materials',
    entityType: 'district',
    entityCode: 'LA_Champasack',
    entityName: 'Champasack',
    items: [],
  },
  {
    dashboardName: 'Teaching-Learning Continuity',
    dashboardId: '60f0c1f661f76a30d7000010',
    dashboardCode: 'LESMIS_EmergencyInEducation_Teaching_Learning_Continuity',
    entityType: 'district',
    entityCode: 'LA_Champasack',
    entityName: 'Champasack',
    items: [],
  },
  {
    dashboardName: 'WASH Affected',
    dashboardId: '60f0c1f661f76a30d7000012',
    dashboardCode: 'LESMIS_EmergencyInEducation_WASH_Affected',
    entityType: 'district',
    entityCode: 'LA_Champasack',
    entityName: 'Champasack',
    items: [],
  },
  {
    dashboardName: 'Staff',
    dashboardId: '60de99cc61f76a1b830006ea',
    dashboardCode: 'LA_Staff',
    entityType: 'district',
    entityCode: 'LA_Champasack',
    entityName: 'Champasack',
    items: [
      {
        code: 'LESMIS_teachers_education_level_district',
        legacy: false,
        reportCode: 'LESMIS_teachers_education_level_district',
        name: 'Number of Teachers: by Level of Education, Gender, GPI',
        type: 'chart',
        xName: 'Level of Education',
        chartType: 'composed',
        chartConfig: {
          GPI: { color: '#ffeb3b', yName: 'GPI', chartType: 'line', yAxisOrientation: 'right' },
          Male: {
            color: '#f44336',
            yName: 'Number of Teachers',
            stackId: '1',
            chartType: 'bar',
            labelType: 'fraction',
            valueType: 'number',
          },
          Female: {
            color: '#2196f3',
            stackId: '1',
            chartType: 'bar',
            labelType: 'fraction',
            valueType: 'number',
          },
        },
        periodGranularity: 'one_year_at_a_time',
      },
    ],
  },
];

export const DashboardSearchResults = ({ searchResults, isActive }) => {
  const { search } = useLocation();
  const { entityCode } = useUrlParams();

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    focused,
    getClearProps,
    popupOpen,
    value,
  } = searchResults;

  // console.log('groupedOptions', JSON.stringify(groupedOptions));
  // todo: get report code

  return (
    <Overlay className={isActive ? 'active' : ''}>
      <Container {...getListboxProps()}>
        <Text>15 Results found</Text>
        {groupedOptions.map((option, index) => {
          return (
            <Result
              key={option.dashboardId}
              to={{
                pathname: `/${entityCode}/dashboard`,
                search: `${search}&reportCode=${option.dashboardCode}`,
              }}
              {...getOptionProps({ option, index })}
            >
              <div>
                <SubHeading>ESDP Early Childhood / 2019 / HLO 5: School leavers</SubHeading>
                <Heading>{option.dashboardName}</Heading>
              </div>
              <ChevronRightIcon />
            </Result>
          );
        })}
      </Container>
    </Overlay>
  );
};

DashboardSearchResults.propTypes = {
  searchResults: PropTypes.object.isRequired,
  isActive: PropTypes.bool,
};

DashboardSearchResults.defaultProps = {
  isActive: false,
};
