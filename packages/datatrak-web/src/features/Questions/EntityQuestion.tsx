/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import RoomIcon from '@material-ui/icons/Room';
import { TextField } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';
import { SelectList, BaseListItem } from '../../components';
import { useEntities, useEntity } from '../../api/queries';
import { useDebounce } from '../../utils';

const Container = styled.div`
  width: 100%;
`;

const ListWrapper = styled.div`
  max-height: 35rem;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const IconWrapper = styled.div`
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
  width: 1.5rem;
`;

const ListItem = ({ item, onSelect }) => {
  const { name, selected } = item;
  const onClick = () => {
    onSelect(item);
  };
  return (
    <BaseListItem button onClick={onClick} selected={selected}>
      <IconWrapper>
        <RoomIcon color="primary" />
      </IconWrapper>
      {name}
    </BaseListItem>
  );
};

const useQuestionEntities = (searchString, config) => {
  const entityConfig = config.entity;
  const parentId = entityConfig?.parentId || 'TO';
  const { type } = entityConfig;
  const debouncedSearch = useDebounce(searchString!, 200);

  return useEntities('explore', parentId, { searchString: debouncedSearch, type });
};

export const EntityQuestion = ({
  id,
  label,
  name,
  controllerProps: { onChange, value, ref },
  config,
}: SurveyQuestionInputProps) => {
  const [isDirty, setIsDirty] = useState(false);
  const [searchString, setSearchString] = useState('');

  const { data: entities } = useQuestionEntities(searchString, config);

  // Display a previously selected value
  useEntity(value, {
    staleTime: 0, // Needs to be 0 to make sure the entity is fetched on first render
    enabled: !!value && !searchString,
    onSuccess: entityData => {
      if (!isDirty) {
        setSearchString(entityData.name);
      }
    },
  });
  const onChangeSearch = event => {
    setIsDirty(true);
    setSearchString(event.target.value);
  };

  const onSelect = entity => {
    setIsDirty(true);
    onChange(entity.value);
  };

  const options = entities
    ?.map(({ name: entityName, id }) => ({
      name: entityName,
      value: id,
      selected: id === value,
    }))
    .filter(({ name }) => {
      if (isDirty || !value) {
        return true;
      }
      return name === searchString;
    });

  const displayValue = isDirty ? searchString : '';

  return (
    <Container>
      <TextField
        id={id}
        label={label}
        name={name!}
        ref={ref}
        onChange={onChangeSearch}
        value={displayValue}
        type="search"
        placeholder="Search"
        autoComplete="one-time-code"
      />
      <ListWrapper>
        <SelectList items={options} onSelect={onSelect} ListItem={ListItem} />
      </ListWrapper>
    </Container>
  );
};
