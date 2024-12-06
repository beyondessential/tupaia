/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { TransitionProps } from '@material-ui/core/transitions';
import Slide from '@material-ui/core/Slide';
import { Tabs, Tab, Fab, Typography } from '@material-ui/core';
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

const Panel = styled.div`
  padding: 1rem 0;
  flex: 1;
  overflow: auto;
`;

const SelectList = styled.div`
  height: 100%;
  border: 1px solid ${({ theme }) => theme.palette.divider};
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

/**
 * Taken from [Material UI's example](https://v4.mui.com/components/dialogs/#full-screen-dialogs) to make the dialog slide up from the bottom
 */
export const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TabPanel = ({ children, value, index, ...props }) => {
  if (value !== index) {
    return null;
  }

  return (
    <Panel
      role="tabpanel"
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...props}
    >
      {children}
    </Panel>
  );
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const SurveyFilter = ({ onChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const user = useCurrentUserContext();
  const { data = [], isLoading } = useProjectSurveys(user.projectId);
  const options =
    data?.map(item => ({
      ...item,
      value: item.id,
      label: item.name,
    })) ?? [];
  const handleChange = newValue => {
    onChange({ id: 'survey.name', value: newValue.name });
  };

  return (
    <MobileAutocomplete
      options={options}
      isLoading={isLoading}
      onChange={handleChange}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    />
  );
};

const EntityFilter = ({ onChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const user = useCurrentUserContext();
  const { data = [], isLoading } = useProjectEntities(user.project?.code);
  const options =
    data?.map(item => ({
      ...item,
      value: item.id,
      label: item.name,
    })) ?? [];
  const handleChange = newValue => {
    onChange({ id: 'entity.name', value: newValue.name });
  };

  return (
    <MobileAutocomplete
      options={options}
      isLoading={isLoading}
      onChange={handleChange}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    />
  );
};

const UserFilter = ({ onChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const user = useCurrentUserContext();
  const { data = [], isLoading } = useProjectUsers(user.project?.code, searchValue);
  const options =
    data?.map(item => ({
      ...item,
      value: item.id,
      label: item.name,
    })) ?? [];
  const handleChange = newValue => {
    onChange({ id: 'assignee_name', value: newValue.name });
  };

  return (
    <MobileAutocomplete
      options={options}
      isLoading={isLoading}
      onChange={handleChange}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    />
  );
};

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

const GreenDot = styled.div`
  position: absolute;
  top: -3px;
  right: -3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ theme }) => theme.palette.success.main};
`;

const TabLabel = ({ label, active }) => {
  return (
    <FlexBox>
      <span>{label}</span>
      {active && <Dot />}
    </FlexBox>
  );
};

export const MobileTaskFilters = ({ filters, onChangeFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(0);

  const onChangeTab = (_event, newValue) => {
    setValue(newValue);
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

  const openFilters = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const clearFilters = () => {
    onChangeFilters([]);
  };

  const getHasFilter = key => filters.some(filter => filter.id === key);
  const hasAnyFilters = filters.length > 0;

  return (
    <>
      <FilterButton onClick={openFilters}>
        <FiltersIcon />
        {hasAnyFilters && <GreenDot />}
      </FilterButton>
      <StyledModal
        open={isOpen}
        onClose={onClose}
        disablePortal={false}
        fullScreen
        TransitionComponent={SlideTransition}
      >
        <Title>Filter by</Title>
        <StyledTabs
          value={value}
          onChange={onChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab
            label={<TabLabel label="Survey" active={getHasFilter('survey.name')} />}
            {...a11yProps(0)}
          />
          <Tab
            label={<TabLabel label="Entity" active={getHasFilter('entity.name')} />}
            {...a11yProps(1)}
          />
          <Tab label="Assignee" {...a11yProps(2)} />
        </StyledTabs>
        <TabPanel value={value} index={0}>
          <SurveyFilter onChange={handleChangeFilters} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <EntityFilter onChange={handleChangeFilters} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <UserFilter onChange={handleChangeFilters} />
        </TabPanel>
        <DialogActions>
          <Button variant="text" color="default" onClick={() => clearFilters()}>
            Clear filters
          </Button>
          <Button onClick={() => onClose()}>Apply</Button>
        </DialogActions>
      </StyledModal>
    </>
  );
};
