/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { DialogActions, Paper, Typography } from '@material-ui/core';
import { Description, FolderOpenTwoTone } from '@material-ui/icons';
import { SpinningLoader, Select as BaseSelect } from '@tupaia/ui-components';
import { useEntities, useSurveys, useUser } from '../api/queries';
import { useEditUser } from '../api/mutations';
import { SelectList, ListItemType, Button } from '../components';
import { Survey } from '../types';
import { useUserCountries, useUserSurveys } from '../utils';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  width: 48rem;
  display: flex;
  flex-direction: column;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 20rem;
  flex: 1;
`;

const ListWrapper = styled.div`
  max-height: 35rem;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Subheader = styled(Typography).attrs({
  variant: 'h2',
})`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  line-height: 1.125;
  font-weight: 400;
  margin-top: 0.67rem;
`;

const Select = styled(BaseSelect)`
  width: 10rem;
  margin-bottom: 0;
  .MuiInputBase-input {
    font-size: 0.875rem;
    padding: 0.5rem 2.5rem 0.5rem 1rem;
  }
  .MuiSvgIcon-root {
    right: 0.5rem;
  }
`;
const Pin = styled.img.attrs({
  src: '/tupaia-pin.svg',
  ['aria-hidden']: true, // this pin is not of any use to the screen reader, so hide from the screen reader
})`
  width: 1rem;
  height: auto;
  margin-right: 0.5rem;
`;
const CountrySelectWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const SurveySelectPage = () => {
  const navigate = useNavigate();
  const [selectedSurvey, setSelectedSurvey] = useState<ListItemType | null>(null);

  const navigateToSurvey = () => {
    navigate(`/survey/${selectedSurvey?.value}`);
  };
  const { mutate: updateUser } = useEditUser(navigateToSurvey);
  const {
    countries,
    selectedCountry,
    updateSelectedCountry,
    countryHasUpdated,
  } = useUserCountries();
  const { surveys, isLoading } = useUserSurveys(selectedCountry?.name);

  // group the data by surveyGroupName for the list, and add the value and selected properties
  const groupedSurveys =
    surveys?.reduce((acc: ListItemType[], survey: Survey) => {
      const { surveyGroupName, name, code } = survey;
      const formattedSurvey = {
        content: name,
        value: code,
        selected: selectedSurvey?.value === code,
        icon: <Description />,
      };
      // if there is no surveyGroupName, add the survey to the list as a top level item
      if (!surveyGroupName) {
        return [...acc, formattedSurvey];
      }
      const group = acc.find(({ content }) => content === surveyGroupName);
      // if the surveyGroupName doesn't exist in the list, add it as a top level item
      if (!group) {
        return [
          ...acc,
          {
            content: surveyGroupName,
            icon: <FolderOpenTwoTone />,
            value: surveyGroupName,
            children: [formattedSurvey],
          },
        ];
      }
      // if the surveyGroupName exists in the list, add the survey to the children
      return acc.map(item => {
        if (item.name === surveyGroupName) {
          return {
            ...item,
            children: [...(item.children || []), formattedSurvey],
          };
        }
        return item;
      });
    }, []) ?? [];

  useEffect(() => {
    // when the surveys change, check if the selected survey is still in the list. If not, clear the selection
    if (selectedSurvey && !surveys?.find(survey => survey.code === selectedSurvey.value)) {
      setSelectedSurvey(null);
    }
  }, [JSON.stringify(surveys)]);

  const handleSelectSurvey = () => {
    if (countryHasUpdated) {
      navigateToSurvey();
      // update user with new country
    } else navigateToSurvey();
  };

  return (
    <Container>
      <HeaderWrapper>
        <div>
          <Typography variant="h1">Select survey</Typography>
          <Subheader>Select a survey from the list below</Subheader>
        </div>
        <CountrySelectWrapper>
          <Pin />
          <Select
            options={
              countries?.map(country => ({ value: country.code, label: country.name })) || []
            }
            value={selectedCountry?.code}
            onChange={e => updateSelectedCountry(e.target.value)}
            aria-label="Country"
          />
        </CountrySelectWrapper>
      </HeaderWrapper>
      {isLoading ? (
        <LoadingContainer>
          <SpinningLoader />
        </LoadingContainer>
      ) : (
        <ListWrapper>
          <SelectList items={groupedSurveys} onSelect={setSelectedSurvey} />
        </ListWrapper>
      )}
      <DialogActions>
        <Button to="/" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSelectSurvey}
          disabled={!selectedSurvey}
          tooltip={selectedSurvey ? '' : 'Select survey to proceed'}
        >
          Next
        </Button>
      </DialogActions>
    </Container>
  );
};
