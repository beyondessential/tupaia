/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { SurveyQuestionInputProps } from '../../types';
import styled from 'styled-components';
import { SelectList } from '../../components';
import { useEntities } from '../../api/queries/useEntities';

const Container = styled.div`
  width: 100%;
`;

const ListWrapper = styled.div`
  max-height: 35rem;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export const EntityQuestion = ({
  id,
  label,
  name,
  type,
  controllerProps: { onChange, value, ref },
  config,
}: SurveyQuestionInputProps) => {
  console.log('config', config);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const { data: entities, isLoading } = useEntities('explore', 'TO');

  const onSelect = project => {
    setSelectedEntityId(project.value);
  };

  const options = entities?.map(({ name: entityName, id }) => ({
    name: entityName,
    value: id,
    selected: id === selectedEntityId,
  }));

  return (
    <Container>
      <ListWrapper>
        <SelectList items={options} label="Select" onSelect={onSelect} />
      </ListWrapper>
      {/*<TextInput*/}
      {/*  label={label}*/}
      {/*  name={name!}*/}
      {/*  ref={ref}*/}
      {/*  onChange={onChange}*/}
      {/*  value={value}*/}
      {/*  textInputProps={{*/}
      {/*    ['aria-describedby']: `question_number_${id}`,*/}
      {/*    type: FIELD_TYPES[type as FIELD_TYPES],*/}
      {/*    placeholder: 'Enter your answer here',*/}
      {/*  }}*/}
      {/*/>*/}
    </Container>
  );
};
