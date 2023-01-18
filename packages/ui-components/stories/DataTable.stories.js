/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Add as AddIcon, IndeterminateCheckBox } from '@material-ui/icons';
import styled from 'styled-components';
import {
  SQLQueryEditor as BaseSQLQueryEditor,
  ParameterList as BaseParameterList,
} from '../src/components/DataTable';
import { Button, IconButton, TextField } from '../src';

export default {
  title: 'Inputs/DataTable',
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

export const SQLQueryEditor = () => {
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

  const removeFromList = key => {
    const newCustomKeywords = new Set(customKeywords);
    newCustomKeywords.delete(key);
    setCustomKeywords(Array.from(newCustomKeywords));
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
          <li key={key}>
            {`${key} `}
            <IconButton onClick={() => removeFromList(key)}>
              <IndeterminateCheckBox />
            </IconButton>
          </li>
        ))}
      </ul>
      <BaseSQLQueryEditor customKeywords={customKeywords} onChange={onChange} value={query} />
    </PanelTabPanel>
  );
};

export const CustomParamaterList = () => {
  const [parameters, setParameters] = useState([
    {
      id: 'parameter_0',
      name: 'dataElementcode',
      type: 'text',
      required: true,
      defaultValue: 'UFO_01',
      hasDefaultValue: true,
    },
    {
      id: `parameter_1`,
      name: 'dataElementcode',
      required: true,
      defaultValue: 'UFO_02',
      hasDefaultValue: true,
    },
  ]);

  const addParameters = () => {
    const defaultNewParameter = {
      id: `parameter_${parameters.length}`,
      name: 'dataElementcode',
      required: true,
      defaultValue: 'UFO_01',
      hasDefaultValue: true,
    };

    setParameters([...parameters, defaultNewParameter]);
  };

  return (
    <div>
      <BaseParameterList parameters={parameters} setParameters={setParameters} />
      <Button variant="outlined" startIcon={<AddIcon />} onClick={addParameters}>
        Add
      </Button>
      <p>{JSON.stringify(parameters, null, 4)}</p>
    </div>
  );
};
