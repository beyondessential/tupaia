/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { DialogActions, Paper, Typography } from '@material-ui/core';
import { Description, FolderOpenTwoTone } from '@material-ui/icons';
import { SpinningLoader } from '@tupaia/ui-components';
import { useSurveys } from '../api/queries';
import { SelectList, ListItemType, Button } from '../components';
import { Survey } from '../types';

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

export const SurveySelectPage = () => {
  const { data, isLoading, isFetched } = useSurveys();
  const [selectedSurvey, setSelectedSurvey] = useState<ListItemType | null>(null);
  const showLoader = isLoading || !isFetched;

  // group the data by surveyGroupName for the list, and add the value and selected properties
  const groupedSurveys =
    data?.reduce((acc: ListItemType[], survey: Survey) => {
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
      const group = acc.find(({ name }) => name === surveyGroupName);
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
  return (
    <Container>
      <Typography variant="h1">Select survey</Typography>
      {showLoader ? (
        <LoadingContainer>
          <SpinningLoader />
        </LoadingContainer>
      ) : (
        <ListWrapper>
          <SelectList
            items={groupedSurveys}
            label="Select a survey from the list below"
            onSelect={setSelectedSurvey}
          />
        </ListWrapper>
      )}
      <DialogActions>
        <Button to="/" variant="outlined">
          Cancel
        </Button>
        <Button
          to={`${selectedSurvey?.value}/1` || ''}
          disabled={!selectedSurvey}
          tooltip={selectedSurvey ? '' : 'Select survey to proceed'}
        >
          Next
        </Button>
      </DialogActions>
    </Container>
  );
};
