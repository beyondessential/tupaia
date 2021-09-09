/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Select } from '@tupaia/ui-components';
import { FlexSpaceBetween, FlexStart } from '../Layout';

const Container = styled(FlexSpaceBetween)`
  margin-top: 1rem;
`;

const NavButton = styled(IconButton)`
  background-color: ${props => props.theme.palette.grey['200']};
  padding: 0.5rem;
  border-radius: 3px;
  color: ${props => (props.disabled ? props.theme.palette.text.secondary : 'inherit')};
  margin-left: 0.5rem;

  &:hover {
    background-color: ${props =>
      props.disabled ? props.theme.palette.grey['200'] : props.theme.palette.primary.main};
    color: ${props => (props.disabled ? props.theme.palette.text.tertiary : 'white')};
  }
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const StyledSelect = styled(Select)`
  width: 10.5rem;
  margin: 0;

  .MuiSvgIcon-root {
    right: 0.5rem;
  }

  .MuiOutlinedInput-notchedOutline {
    border: none;
  }

  .MuiSelect-root {
    padding: 0.75rem 0.6rem 0.75rem 1rem;
    color: ${props => props.theme.palette.text.secondary};
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1rem;
    background: ${props => props.theme.palette.grey['200']};

    &:focus {
      background: ${props => props.theme.palette.grey['200']};
    }
  }
`;

export const Paginator = ({
  canNextPage,
  canPreviousPage,
  nextPage,
  pageIndex,
  pageSize,
  previousPage,
  setPageSize,
  totalCount,
}) => {
  const pageStart = pageIndex * pageSize + 1;
  const pageEnd = (pageIndex + 1) * pageSize;
  const overallPageEnd = Math.min(pageEnd, totalCount);
  return (
    <Container>
      <StyledSelect
        id="page"
        value={pageSize}
        onChange={e => {
          setPageSize(Number(e.target.value));
        }}
        showPlaceholder={false}
        options={[
          { label: 'Rows per page: 10', value: 10 },
          { label: 'Rows per page: 20', value: 20 },
          { label: 'Rows per page: 50', value: 50 },
          { label: 'Rows per page: 100', value: 100 },
        ]}
      />
      {totalCount > pageSize && (
        <FlexStart>
          <Text>
            {pageStart}-{overallPageEnd} of {totalCount}
          </Text>
          <NavButton onClick={() => previousPage()} disabled={!canPreviousPage}>
            <ChevronLeftIcon />
          </NavButton>
          <NavButton onClick={() => nextPage()} disabled={!canNextPage}>
            <ChevronRightIcon />
          </NavButton>
        </FlexStart>
      )}
    </Container>
  );
};

Paginator.propTypes = {
  canNextPage: PropTypes.bool.isRequired,
  canPreviousPage: PropTypes.bool.isRequired,
  nextPage: PropTypes.func.isRequired,
  pageIndex: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  previousPage: PropTypes.func.isRequired,
  setPageSize: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
};
