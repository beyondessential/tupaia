/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Dialog, DialogActions, Paper, Typography } from '@material-ui/core';
import { useCurrentUser, useEntities, useSurvey } from '../../../api';
import { Button, SelectList } from '../../../components';
import { useEditUser } from '../../../api/mutations';
import { useParams } from 'react-router-dom';
import { SurveyParams } from '../../../types';

const Wrapper = styled(Paper)`
  padding: 1rem 1.25rem;
  max-width: none;
  width: 48rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1.5rem 2.5rem 1.25rem;
    margin: 2rem;
  }
`;

export const CountrySelectModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const { surveyCode } = useParams<SurveyParams>();
  const { data: survey } = useSurvey(surveyCode);
  const user = useCurrentUser();
  const { mutate, isLoading: isConfirming } = useEditUser(() => {
    setIsOpen(false);
  });
  const { data: countries } = useEntities(user.project?.code, {
    type: 'country',
  });

  const surveyCountryNames = survey?.countryNames || [];
  const userCountryName = user.country?.name;

  useEffect(() => {
    // If the countries have not loaded yet, Or If there is a valid country selected, then don't do anything
    if (!countries || (userCountryName && surveyCountryNames.includes(userCountryName))) {
      return;
    }

    // If there is only one country for a survey, simply select it
    if (surveyCountryNames.length === 1) {
      const country = countries?.find(country => surveyCountryNames[0] === country.name);

      if (country?.id) {
        mutate({ countryId: country.id });
        return;
      }
    }

    // Otherwise, open the modal and let the user select a country
    setIsOpen(true);
  }, [JSON.stringify(surveyCountryNames), userCountryName, JSON.stringify(countries)]);

  const onConfirm = () => {
    mutate({ countryId: selectedCountryId! });
  };

  const onSelect = country => {
    setSelectedCountryId(country.value);
  };

  const getFormattedCountries = () => {
    return (
      countries
        ?.filter(country => surveyCountryNames.includes(country.name))
        ?.map(country => {
          return {
            content: country.name,
            value: country.id,
          };
        })
        .sort((a, b) => a.content.localeCompare(b.content)) ?? []
    );
  };

  // sort the countries alphabetically so they are in a consistent order for the user
  const countryOptions = getFormattedCountries();

  return (
    <Dialog open={isOpen} PaperComponent={Wrapper}>
      <Typography variant="h1">Select country</Typography>
      <SelectList
        items={countryOptions}
        label="You must select a country from the list below to proceed with the survey."
        onSelect={onSelect}
      />
      <DialogActions>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          isLoading={isConfirming}
          disabled={!selectedCountryId}
          tooltip={selectedCountryId ? '' : 'Select country to proceed'}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
