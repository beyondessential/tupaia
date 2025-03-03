import { FormHelperText, FormLabelProps } from '@material-ui/core';
import React, { ComponentPropsWithoutRef } from 'react';
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

interface GroupedSurveyListProps
  extends UseGroupedSurveyListParams,
    ComponentPropsWithoutRef<typeof ListWrapper> {
  label?: string;
  labelProps?: FormLabelProps & {
    component?: React.ElementType;
  };
  error?: string;
}

export const GroupedSurveyList = ({
  selectedCountry,
  setSelectedSurvey,
  selectedSurvey,
  label,
  labelProps,
  error,
  ...props
}: GroupedSurveyListProps) => {
  const { groupedSurveys, onSelectSurvey } = useGroupedSurveyList({
    selectedCountry,
    setSelectedSurvey,
    selectedSurvey,
  });
  return (
    <ListWrapper {...props}>
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
