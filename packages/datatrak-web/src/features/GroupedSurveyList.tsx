import { FormHelperText, FormLabelProps } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

import { Country } from '@tupaia/types';
import { SelectList } from '@tupaia/ui-components';

import { Survey } from '../types';
import { useGroupedSurveyList } from './useGroupedSurveyList';

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

interface GroupedSurveyListProps {
  setSelectedSurvey: (surveyCode: Survey['code'] | null) => void;
  selectedSurvey: Survey['code'] | null;
  selectedCountry?: Country | null;
  label?: string;
  labelProps?: FormLabelProps & {
    component?: React.ElementType;
  };
  error?: string;
}

export const GroupedSurveyList = ({
  setSelectedSurvey,
  selectedSurvey,
  selectedCountry,
  label,
  labelProps,
  error,
}: GroupedSurveyListProps) => {
  const { groupedSurveys, onSelectSurvey } = useGroupedSurveyList({
    setSelectedSurvey,
    selectedSurvey,
    selectedCountry,
  });
  return (
    <ListWrapper>
      <SelectList
        items={groupedSurveys}
        onSelect={onSelectSurvey}
        label={label}
        labelProps={labelProps}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
    </ListWrapper>
  );
};
