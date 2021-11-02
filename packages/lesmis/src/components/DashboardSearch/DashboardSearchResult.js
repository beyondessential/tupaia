/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useUrlParams } from '../../utils';
import { NoResultsMessage } from '../NoResultsMessage';

const Overlay = styled.div`
  display: none;

  &.active {
    display: block;
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

const Text = styled(Typography)`
  margin-bottom: 20px;
`;

const NoResultsBox = styled.div`
  background: #f9f9f9;
  padding: 50px 15px;
`;

export const DashboardSearchResults = ({ searchResults, isActive, year }) => {
  const { search } = useLocation();
  const { entityCode } = useUrlParams();

  const { getListboxProps, getOptionProps, groupedOptions, inputValue } = searchResults;
  const showNoResults = inputValue;

  return (
    <Overlay className={isActive ? 'active' : ''}>
      <Container {...getListboxProps()}>
        {groupedOptions.length > 0 ? (
          <>
            <Text>
              {groupedOptions.length} Result{groupedOptions.length > 1 && 's'} found
            </Text>
            {groupedOptions.map((option, index) => {
              return (
                <Result
                  key={option.code}
                  to={{
                    pathname: `/${entityCode}/dashboard`,
                    search: `${search}&reportCode=${option.reportCode}`,
                  }}
                  {...getOptionProps({ option, index })}
                >
                  <div>
                    <SubHeading>
                      {option.entityName} / {year} / {option.dashboardName}
                    </SubHeading>
                    <Heading>{option.name}</Heading>
                  </div>
                  <ChevronRightIcon />
                </Result>
              );
            })}
          </>
        ) : (
          showNoResults && (
            <NoResultsBox>
              <NoResultsMessage inputValue={inputValue} />
            </NoResultsBox>
          )
        )}
      </Container>
    </Overlay>
  );
};

DashboardSearchResults.propTypes = {
  searchResults: PropTypes.object.isRequired,
  isActive: PropTypes.bool,
  year: PropTypes.string.isRequired,
};

DashboardSearchResults.defaultProps = {
  isActive: false,
};
