import { Fab, Slide, Tab, Tabs, TabsProps, Typography } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import { UseQueryResult } from '@tanstack/react-query';
import { ListFilter as FilterIcon } from 'lucide-react';
import React, { useState } from 'react';
import styled from 'styled-components';

import { FilterableTableProps, useDebounce } from '@tupaia/ui-components';

import {
  CurrentUserContextType,
  useCurrentUserContext,
  useProjectEntities,
  useProjectUsersQuery,
} from '../../../api';
import { useSurveysQuery } from '../../../api/queries/useSurveysQuery';
import { Button } from '../../../components';
import { Modal, ModalBody, ModalCloseButton } from '../../../components/Modal';
import { MobileAutocomplete, MobileAutocompleteProps } from './MobileAutocomplete';
import { useDisableDesktopTaskFiltersWhileMounted } from './useDisableDesktopTaskFiltersWhileMounted';
import { useResetTasksTableFiltersOnUnmount } from './useResetTasksTableFiltersOnUnmount';

const FilterButton = styled(Fab).attrs({ color: 'primary' })`
  bottom: max(env(safe-area-inset-bottom, 0), 1rem);
  right: max(env(safe-area-inset-right, 0), 1.25rem);
  position: absolute;

  // TODO: Remove this override in RN-1551
  bottom: calc(max(env(safe-area-inset-bottom, 0), 1rem) + 3.25rem);
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

const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledModal = styled(Modal).attrs({
  TransitionComponent: SlideTransition,
  disablePortal: false,
  fullScreen: true,
})`
  padding-top: calc(env(safe-area-inset-top, 0), 10rem);

  .MuiDialog-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    > .MuiPaper-root {
      border-start-end-radius: 0.625rem;
      border-start-start-radius: 0.625rem;
      max-block-size: 50rem;
      padding-bottom: calc(env(safe-area-inset-bottom, 0) + 1rem);
      padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
      padding-right: max(env(safe-area-inset-right, 0), 1.25rem);
      padding-top: 0;
    }
  }

  ${ModalBody} {
    block-size: 100%;
    display: grid;
    grid-template-areas: '--header' '--tabs' '--autocomplete' '--actions';
    grid-template-rows: auto auto minmax(0, 1fr) auto;
  }

  ${ModalCloseButton} {
    display: none;
  }
`;

const StyledTabs = styled(Tabs).attrs({
  indicatorColor: 'primary',
  textColor: 'primary',
  variant: 'fullWidth',
})`
  --border: max(0.0625rem, 1px) solid ${props => props.theme.palette.primary.main};
  border-radius: 0.3125rem;
  border: var(--border);
  grid-area: --tabs;
  margin-block-end: 0.875rem;
  margin-block-start: 1.5rem;
  min-block-size: 2.4rem;

  .MuiTabs-indicator {
    display: none;
  }

  .MuiTab-root {
    color: ${({ theme }) => theme.palette.text.secondary};
    text-transform: none;
    min-height: 0;

    &:not(:last-child) {
      border-inline-end: var(--border);
    }

    &.Mui-selected {
      background-color: oklch(63.33% 0.157 251.26 / 10%);
      color: ${props => props.theme.palette.text.primary};
    }
  }
`;

const ButtonGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row-reverse;
  gap: 0.5rem;
  grid-area: --actions;
  justify-content: center;
  margin-block-start: 1rem;

  .MuiButton-root {
    flex: 1;
    margin: 0;
    max-inline-size: 12rem;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.125rem;
  grid-area: --header;
`;

const StyledTab = styled(Tab)`
  .MuiTab-wrapper {
    display: contents;
  }
`;

const ActiveFilterIndicator = styled.div.attrs({
  'aria-label': 'Filter is active',
})`
  background-color: ${props => props.theme.palette.primary.main};
  border-radius: 50%;
  display: inline-block;
  height: 0.4375rem;
  margin-inline-start: 0.35rem;
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
  <StyledTabs value={value} onChange={onChange}>
    {tabs.map((tab, index) => (
      <StyledTab
        key={tab.id}
        label={
          <>
            {tab.label}
            {tab.active && <ActiveFilterIndicator />}
          </>
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

  const handleChange: MobileAutocompleteProps['onChange'] = (event, newValue) => {
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

interface MobileTaskFiltersProps extends Pick<FilterableTableProps, 'filters' | 'onChangeFilters'> {
  resultCount?: number;
}

type MobileTaskFilterTab = 0 | 1 | 2;

export const MobileTaskFilters = ({
  filters = [],
  onChangeFilters,
  resultCount,
}: MobileTaskFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tabValue, setTabValue] = useState<MobileTaskFilterTab>(0);

  useDisableDesktopTaskFiltersWhileMounted();
  useResetTasksTableFiltersOnUnmount();

  const getHasFilter = key => filters.some(filter => filter.id === key);
  const tabs = [
    { id: 'survey', label: 'Survey', active: getHasFilter('survey.id') },
    { id: 'entity', label: 'Entity', active: getHasFilter('entity.id') },
    { id: 'assignee', label: 'Assignee', active: getHasFilter('assignee.id') },
  ] as const;

  const onChangeTab = (_event: React.ChangeEvent<{}>, newValue: MobileTaskFilterTab) => {
    setTabValue(newValue);
  };

  const handleChangeFilters = (_event, newEntry) => {
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
      <FilterButton onClick={() => void setIsOpen(true)}>
        <FilterIcon aria-hidden style={{ fontSize: '1.5rem' }} />
        {filters.length > 0 && <FilterIndicator />}
      </FilterButton>
      <StyledModal open={isOpen} onClose={() => void setIsOpen(false)}>
        <Title>Filter by</Title>
        <FilterTabs tabs={tabs} value={tabValue} onChange={onChangeTab} />
        {tabValue === 0 && (
          <Filter
            fetchFunction={(user, search) =>
              useSurveysQuery({ projectId: user.projectId, searchTerm: search })
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
        <ButtonGroup>
          <Button onClick={() => void setIsOpen(false)}>
            Show results{' '}
            {resultCount !== undefined ? (
              <span style={{ marginInlineStart: '.5ch', opacity: 0.65 }}>({resultCount})</span>
            ) : null}
          </Button>
          <Button variant="text" color="default" onClick={clearFilters}>
            Clear filters
          </Button>
        </ButtonGroup>
      </StyledModal>
    </>
  );
};
