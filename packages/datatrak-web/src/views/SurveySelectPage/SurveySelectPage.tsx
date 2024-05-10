/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { DialogActions, Paper, Typography } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { useEditUser } from '../../api/mutations';
import { SelectList, ListItemType, Button, SurveyFolderIcon, SurveyIcon } from '../../components';
import { Survey } from '../../types';
import { useCurrentUserContext, useProjectSurveys } from '../../api';
import { HEADER_HEIGHT } from '../../constants';
import { SurveyCountrySelector } from './SurveyCountrySelector';
import { useUserCountries } from './useUserCountries';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  width: 48rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &.MuiPaper-root {
    max-height: 100%;
    height: 35rem;
  }
  ${({ theme }) => theme.breakpoints.down('sm')} {
    width: 100%;
    border-radius: 0;
    border-left: none;
    border-right: none;
    &.MuiPaper-root {
      height: 100%;
    }
    // parent selector - targets the parent of this container
    div:has(&) {
      padding: 0;
      align-items: flex-start;
      height: calc(100vh - ${HEADER_HEIGHT});
    }
  }
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
  flex: 1;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    max-height: 100%;
  }
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 1rem;
  > div {
    width: 100%;
  }
  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    > div {
      width: auto;
    }
  }
`;

const Subheader = styled(Typography).attrs({
  variant: 'h2',
})`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  line-height: 1.125;
  font-weight: 400;
  margin-top: 0.67rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-bottom: 0.5rem;
  }
`;

const sortAlphanumerically = (a: ListItemType, b: ListItemType) => {
  return (a.content as string).trim()?.localeCompare((b.content as string).trim(), 'en', {
    numeric: true,
  });
};

export const SurveySelectPage = () => {
  const navigate = useNavigate();
  const [selectedSurvey, setSelectedSurvey] = useState<ListItemType | null>(null);
  const {
    countries,
    selectedCountry,
    updateSelectedCountry,
    countryHasUpdated,
    isLoading: isLoadingCountries,
  } = useUserCountries();
  const navigateToSurvey = () => {
    navigate(`/survey/${selectedCountry?.code}/${selectedSurvey?.value}`);
  };
  const { mutate: updateUser, isLoading: isUpdatingUser } = useEditUser(navigateToSurvey);
  const user = useCurrentUserContext();

  const { data: surveys, isLoading } = useProjectSurveys(user.projectId, selectedCountry?.name);

  // group the data by surveyGroupName for the list, and add the value and selected properties
  const groupedSurveys =
    surveys
      ?.reduce((acc: ListItemType[], survey: Survey) => {
        const { surveyGroupName, name, code } = survey;
        const formattedSurvey = {
          content: name,
          value: code,
          selected: selectedSurvey?.value === code,
          icon: <SurveyIcon />,
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
              icon: <SurveyFolderIcon />,
              value: surveyGroupName,
              children: [formattedSurvey],
            },
          ];
        }
        // if the surveyGroupName exists in the list, add the survey to the children
        return acc.map(item => {
          if (item.content === surveyGroupName) {
            return {
              ...item,
              // sort the folder items alphanumerically
              children: [...(item.children || []), formattedSurvey].sort(sortAlphanumerically),
            };
          }
          return item;
        });
      }, [])
      ?.sort(sortAlphanumerically) ?? [];

  const handleSelectSurvey = () => {
    if (countryHasUpdated) {
      // update user with new country. If the user goes 'back' and doesn't select a survey, and does not yet have a country selected, that's okay because it will be set whenever they next select a survey
      updateUser({ countryId: selectedCountry?.id });
    } else navigateToSurvey();
  };

  useEffect(() => {
    // when the surveys change, check if the selected survey is still in the list. If not, clear the selection
    if (selectedSurvey && !surveys?.find(survey => survey.code === selectedSurvey.value)) {
      setSelectedSurvey(null);
    }
  }, [JSON.stringify(surveys)]);

  const showLoader = isLoading || isLoadingCountries || isUpdatingUser;
  return (
    <Container>
      <HeaderWrapper>
        <div>
          <Typography variant="h1">Select survey</Typography>
          <Subheader>Select a survey from the list below</Subheader>
        </div>
        <SurveyCountrySelector
          countries={countries}
          selectedCountry={selectedCountry}
          onChangeCountry={updateSelectedCountry}
        />
      </HeaderWrapper>
      {showLoader ? (
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
          disabled={!selectedSurvey || isUpdatingUser}
          tooltip={selectedSurvey ? '' : 'Select survey to proceed'}
        >
          Next
        </Button>
      </DialogActions>
    </Container>
  );
};
