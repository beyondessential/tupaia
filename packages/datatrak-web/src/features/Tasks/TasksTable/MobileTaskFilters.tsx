import { Fab, Slide, Tab, Tabs, TabsProps, Typography } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import { UseQueryResult } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';

import { useDebounce } from '@tupaia/ui-components';

import {
  CurrentUserContextType,
  useCurrentUserContext,
  useProjectEntities,
  useProjectSurveys,
  useProjectUsersQuery,
} from '../../../api';
import { Button, FiltersIcon } from '../../../components';
import { Modal } from '../../../components/Modal';
import { MobileAutocomplete } from './MobileAutocomplete';

const FilterButton = styled(Fab).attrs({ color: 'primary' })`
  position: absolute;
  bottom: 1rem;
  right: 2rem;

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

const FilterIndicator = styled.div`
  background-color: ${props => props.theme.palette.success.main};
  border-radius: calc(infinity * 1px);
  height: 1.375rem;
  inset-block-start: -0.2rem;
  inset-inline-end: -0.2rem;
  position: absolute;
  width: 1.375rem;
`;

const StyledModal = styled(Modal)`
  .MuiDialog-scrollPaper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    > .MuiPaper-root {
      border-start-end-radius: 0.625rem;
      border-start-start-radius: 0.625rem;
      max-block-size: 37.5rem;
      padding-block: 0;

      > div {
        display: flex;
        height: 100%;
        flex-direction: column;
        justify-content: space-between;
      }
    }
  }
`;

const StyledTabs = styled(Tabs)`
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
  border-radius: 5px;
  margin-block-start: 1.5rem;
  margin-block-end: 0.875rem;
  min-height: 2.4rem;

  .MuiTabs-indicator {
    display: none;
  }

  .MuiTab-root {
    color: ${({ theme }) => theme.palette.text.secondary};
    text-transform: none;
    min-height: 0;

    &:not(:last-child) {
      border-inline-end: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.primary.main};
    }

    &.Mui-selected {
      color: ${({ theme }) => theme.palette.text.primary};
      background-color: oklch(63.33% 0.157 251.26 / 10%);
    }
  }
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-inline: 0.5rem;
  padding-block: 0.5rem;

  .MuiButton-root {
    min-width: 6rem;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.125rem;
`;

const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TabLabel = styled.div`
  display: flex;
  align-items: center;
`;

const Dot = styled.div`
  background-color: ${props => props.theme.palette.primary.main};
  border-radius: 50%;
  height: 0.4375rem;
  margin-inline-start: 0.5rem;
  width: 0.4375rem;
`;

interface FilterTab {
  active?: boolean;
  id: string;
  label: string;
}

interface FilterTabsProps extends Pick<TabsProps, 'value'> {
  /**
   * @privateRemarks Manually picked from {@link TabsProps}. For some reason,
   * {@link TabsProps['onChange']} includes `& React.FormEventHandler<HTMLButtonElement>`; and
   * `Exclude<>`-ing it leaves only `undefined`.
   */
  onChange?: (event: React.ChangeEvent<{}>, value: any) => void;
  tabs: readonly FilterTab[];
}

const FilterTabs = ({ tabs, value, onChange }: FilterTabsProps) => (
  <StyledTabs
    value={value}
    onChange={onChange}
    indicatorColor="primary"
    textColor="primary"
    variant="fullWidth"
  >
    {tabs.map((tab, index) => (
      <Tab
        key={tab.id}
        label={
          <TabLabel>
            <span>{tab.label}</span>
            {tab.active && <Dot aria-hidden />}
          </TabLabel>
        }
        aria-controls={`tabpanel-${index}`}
        id={`tab-${index}`}
      />
    ))}
  </StyledTabs>
);

interface FilterProps {
  fetchFunction: (
    user: CurrentUserContextType,
    searchValue: string,
  ) => UseQueryResult<{ id: string; name: string }[]>;
  filterKey: string;
  onChange: (event: React.ChangeEvent<{}>, value: any) => void;
  value: any;
}

const Filter = ({ fetchFunction, filterKey, onChange, value }: FilterProps) => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 100);
  const user = useCurrentUserContext();
  const { data = [], isLoading } = fetchFunction(user, debouncedSearch);

  const options = data.map(item => ({
    id: item.id,
    value: item.id,
    label: item.name,
  }));

  const handleChange = (event, newValue) => {
    onChange(event, { id: filterKey, value: newValue.value });
  };

  return (
    <MobileAutocomplete
      options={options}
      isLoading={isLoading}
      onChange={handleChange}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      value={value}
    />
  );
};

export const MobileTaskFilters = ({ filters, onChangeFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const getHasFilter = key => filters.some(filter => filter.id === key);
  const tabs = [
    { id: 'survey', label: 'Survey', active: getHasFilter('survey.id') },
    { id: 'entity', label: 'Entity', active: getHasFilter('entity.id') },
    { id: 'assignee', label: 'Assignee', active: getHasFilter('assignee.id') },
  ] as const;

  const onChangeTab = (_event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangeFilters = newEntry => {
    const originalFilters = [...filters];
    const index = originalFilters.findIndex(filter => filter.id === newEntry.id);

    if (index !== -1) {
      // If it exists, overwrite the existing entry
      originalFilters[index] = newEntry;
    } else {
      // Otherwise, add the new entry to the array
      originalFilters.push(newEntry);
    }

    onChangeFilters(originalFilters);
  };

  const clearFilters = () => {
    onChangeFilters([]);
  };

  const getFilterValue = (filterKey: string) => {
    const filter = filters.find(f => f.id === filterKey);
    return filter?.value ? { id: filter.value } : null;
  };

  return (
    <>
      <FilterButton
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <FiltersIcon />
        {filters.length > 0 && <FilterIndicator />}
      </FilterButton>
      <StyledModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        disablePortal={false}
        fullScreen
        TransitionComponent={SlideTransition}
      >
        <Title>Filter by</Title>
        <FilterTabs tabs={tabs} value={tabValue} onChange={onChangeTab} />
        {tabValue === 0 && (
          <Filter
            fetchFunction={(user, search) =>
              useProjectSurveys(user.projectId, { searchTerm: search })
            }
            filterKey="survey.id"
            onChange={handleChangeFilters}
            value={getFilterValue('survey.id')}
          />
        )}
        {tabValue === 1 && (
          <Filter
            fetchFunction={(user, search) =>
              useProjectEntities(user.project?.code, { searchString: search, filter: {} })
            }
            filterKey="entity.id"
            onChange={handleChangeFilters}
            value={getFilterValue('entity.id')}
          />
        )}
        {tabValue === 2 && (
          <Filter
            fetchFunction={(user, search) => useProjectUsersQuery(user.project?.code, search)}
            filterKey="assignee.id"
            onChange={handleChangeFilters}
            value={getFilterValue('assignee.id')}
          />
        )}
        <DialogActions>
          <Button variant="text" color="default" onClick={clearFilters}>
            Clear filters
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </StyledModal>
    </>
  );
};
