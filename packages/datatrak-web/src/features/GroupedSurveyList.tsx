import { FormHelperText, FormLabelProps } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

import { SelectList } from '@tupaia/ui-components';

import { UseGroupedSurveyListParams, useGroupedSurveyList } from './useGroupedSurveyList';

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

interface GroupedSurveyListProps extends UseGroupedSurveyListParams {
  label?: string;
  labelProps?: FormLabelProps & {
    component?: React.ElementType;
  };
  error?: string;
}

export const GroupedSurveyList = ({
  setSelectedSurvey,
  selectedSurvey,
  label,
  labelProps,
  error,
}: GroupedSurveyListProps) => {
  const { groupedSurveys, onSelectSurvey } = useGroupedSurveyList({
    setSelectedSurvey,
    selectedSurvey,
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
