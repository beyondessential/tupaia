/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { CountryAccessListItem } from '../../types';
import { Link, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { List } from '@material-ui/core';
import { AuthModalButton, RouterButton } from '../../components';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from '../../constants';

const Text = styled(Typography)`
  margin-bottom: 1rem;
`;

const SubHeading = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
`;

const AccessRequestList = styled(List)`
  list-style-type: none;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  font-size: 1rem;
`;

interface RequestedCountriesProps {
  requestedCountries: CountryAccessListItem[];
  onShowForm: () => void;
  hasAdditionalCountries: boolean;
}
export const RequestedCountries = ({
  requestedCountries,
  onShowForm,
  hasAdditionalCountries,
}: RequestedCountriesProps) => {
  return (
    <div>
      <Text>
        <b>You have already requested access to this project.</b>
      </Text>
      <SubHeading variant="h3">Countries requested for this project:</SubHeading>
      <AccessRequestList>
        {requestedCountries.map(({ name }) => (
          <li key={name}>{name}</li>
        ))}
      </AccessRequestList>
      <Text>
        This can take some time to process, as requests require formal permission to be granted.
      </Text>
      <Text>
        If you have any questions, please email:&nbsp;
        <Link href="mailto:admin@tupaia.org">admin@tupaia.org</Link>
      </Text>
      {hasAdditionalCountries && (
        <AuthModalButton color="default" variant="outlined" onClick={onShowForm}>
          Request additional countries
        </AuthModalButton>
      )}
      <AuthModalButton
        component={RouterButton}
        modal={MODAL_ROUTES.PROJECTS}
        searchParamsToRemove={[URL_SEARCH_PARAMS.PROJECT]}
      >
        Back to projects
      </AuthModalButton>
    </div>
  );
};
