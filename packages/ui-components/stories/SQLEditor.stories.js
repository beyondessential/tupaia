/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import styled from 'styled-components';
import { SQLEditor } from '../src/components/SQLEditor';
import { Button, TextField } from '../src';

export default {
  title: 'Inputs/SQLEditor',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

const PanelTabPanel = styled.div`
  > div {
    width: 50%;
    height: 200px;
  }
`;

export const Simple = () => {
  const { handleSubmit, register } = useForm();
  const [query, setQuery] = useState('select * from ...');
  const [customKeywords, setCustomKeywords] = React.useState(['aaa']);

  const onSubmit = handleSubmit((data, event) => {
    const newCustomKeywords = new Set(customKeywords);
    newCustomKeywords.add(data.newParameter);
    setCustomKeywords(Array.from(newCustomKeywords));
    event.target.reset();
  });

  const onChange = newValue => {
    setQuery(newValue);
  };

  return (
    <PanelTabPanel>
      <Container>
        <form onSubmit={onSubmit}>
          <TextField
            id="newParameter"
            name="newParameter"
            placeholder="Text"
            type="text"
            label="New parameter"
            inputRef={register({
              required: 'Required',
            })}
          />
          <Button type="submit">Add parameter</Button>
        </form>
      </Container>
      Custom parameters:
      <ul>
        {customKeywords.map(key => (
          <ui key={key}>{`${key} `}</ui>
        ))}
      </ul>
      <SQLEditor customKeywords={customKeywords} onChange={onChange} value={query} />
    </PanelTabPanel>
  );
};
