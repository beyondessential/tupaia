import React, { useState } from 'react';
import styled from 'styled-components';
import { TransitionProps } from '@material-ui/core/transitions';
import Slide from '@material-ui/core/Slide';
import { Tabs, Tab, Fab, Typography } from '@material-ui/core';
import { useDebounce } from '@tupaia/ui-components';
import { FiltersIcon, Modal, Button } from '../../../components';
import { MobileAutocomplete } from './MobileAutocomplete';
import {
  useCurrentUserContext,
  useProjectEntities,
  useProjectSurveys,
  useProjectUsers,
} from '../../../api';

const FilterButton = styled(Fab).attrs({ color: 'primary' })`
  position: absolute;
  bottom: 1rem;
  right: 2rem;

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

const GreenDot = styled.div`
  position: absolute;
  top: -3px;
  right: -3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ theme }) => theme.palette.success.main};
`;

const StyledModal = styled(Modal)`
  .MuiDialog-scrollPaper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    > .MuiPaper-root {
      max-height: 600px;

      > div {
        height: 100%;
        display: flex;
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

  .MuiTabs-indicator {
    display: none;
  }

  .MuiTab-root {
    border-right: 1px solid ${({ theme }) => theme.palette.primary.main};
    color: ${({ theme }) => theme.palette.text.primary};

    &.Mui-selected {
      background: rgba(50, 141, 229, 0.1);
    }

    &:last-child {
      border-right: none;
    }
  }
`;

const DialogActions = styled.div`
  display: flex;
  padding: 8px;
  align-items: center;
  justify-content: center;
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

const FlexBox = styled.div`
  display: flex;
  align-items: center;
`;

const Dot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-left: 0.5rem;
  background: ${({ theme }) => theme.palette.primary.main};
`;

const FilterTabs = ({ tabs, value, onChange }) => (
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
          <FlexBox>
            <span>{tab.label}</span>
            {tab.active && <Dot />}
          </FlexBox>
        }
        aria-controls={`tabpanel-${index}`}
        id={`tab-${index}`}
      />
    ))}
  </StyledTabs>
);

const Filter = ({ fetchFunction, labelKey, onChange, value }) => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 200);
  const user = useCurrentUserContext();
  const { data = [], isLoading } = fetchFunction(user, debouncedSearch);

  const options = data.map(item => ({
    value: item.id,
    label: item[labelKey],
  }));

  const handleChange = newValue => onChange({ id: `${labelKey}.id`, value: newValue.id });

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
  ];

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

  const getFilterValue = key => {
    const filter = filters.find(f => f.id === key);
    return filter?.value ? { id: filter.value } : null;
  };

  return (
    <>
      <FilterButton
        onClick={() => {
          setIsOpen(false);
        }}
      >
        <FiltersIcon />
        {filters.length > 0 && <GreenDot />}
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
            labelKey="name"
            onChange={handleChangeFilters}
            value={getFilterValue('survey.id')}
          />
        )}
        {tabValue === 1 && (
          <Filter
            fetchFunction={(user, search) =>
              useProjectEntities(user.project?.code, { searchString: search, filter: {} })
            }
            labelKey="name"
            onChange={handleChangeFilters}
            value={getFilterValue('entity.id')}
          />
        )}
        {tabValue === 2 && (
          <Filter
            fetchFunction={(user, search) => useProjectUsers(user.project?.code, search)}
            labelKey="name"
            onChange={handleChangeFilters}
            value={getFilterValue('assignee.id')}
          />
        )}
        <DialogActions>
          <Button variant="text" color="default" onClick={() => clearFilters()}>
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
