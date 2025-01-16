import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useUrlParams } from '../../utils';
import { NoResultsMessage } from '../NoResultsMessage';
import * as COLORS from '../../constants';

const Container = styled.div`
  display: none;
  width: 950px;
  max-width: 100%;
  margin: 0 auto;
  padding: ${props => props.theme.spacing(5, 3)};

  &.active {
    display: block;
    background: white;
    height: auto;
    min-height: 100%;
    z-index: 1;
  }
`;

const Result = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  background: ${COLORS.GREY_F9};
  border-radius: 3px;
  padding: 30px;
  margin-bottom: 20px;

  .MuiSvgIcon-root {
    color: ${props => props.theme.palette.primary.main};
  }

  &:hover {
    background: ${COLORS.GREY_F1};
  }
`;

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  color: ${props => props.theme.palette.text.primary};
`;

const SubHeading = styled(Typography)`
  font-size: 12px;
  line-height: 14px;
  margin-bottom: 10px;
  color: ${props => props.theme.palette.primary.main};
`;

const Text = styled(Typography)`
  margin-bottom: 20px;
`;

const NoResultsBox = styled.div`
  background: ${COLORS.GREY_F9};
  padding: ${props => props.theme.spacing(6, 2)};
`;

export const DashboardSearchResults = ({ autocompleteResponse, isActive }) => {
  const { search } = useLocation();
  const { locale, entityCode } = useUrlParams();

  const { getListboxProps, getOptionProps, groupedOptions, inputValue } = autocompleteResponse;

  return (
    <Container className={isActive ? 'active' : ''} {...getListboxProps()}>
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
                  pathname: `/${locale}/${entityCode}/dashboard`,
                  search: `${search}&reportCode=${option.reportCode}`,
                }}
                {...getOptionProps({ option, index })}
              >
                <div>
                  <SubHeading>
                    {option.entityName} / {option.subDashboardName} / {option.dashboardName}
                  </SubHeading>
                  <Heading>{option.name}</Heading>
                </div>
                <ChevronRightIcon />
              </Result>
            );
          })}
        </>
      ) : (
        inputValue && (
          <NoResultsBox>
            <NoResultsMessage inputValue={inputValue} />
          </NoResultsBox>
        )
      )}
    </Container>
  );
};

DashboardSearchResults.propTypes = {
  autocompleteResponse: PropTypes.object.isRequired, // material-ui autocomplete response object
  isActive: PropTypes.bool,
};

DashboardSearchResults.defaultProps = {
  isActive: false,
};
