/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Add as AddIcon, IndeterminateCheckBox } from '@material-ui/icons';
import styled from 'styled-components';
import {
  ParameterList as BaseParameterList,
  PreviewFilters as BasePreviewFilters,
} from '../src/components/DataTable';
import { SQLQueryEditor as BaseSQLQueryEditor, Button, IconButton, TextField } from '../src';

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

const useParameters = defaultParameters => {
  const [parameters, setParameters] = useState(defaultParameters);

  const onAdd = () => {
    const defaultNewParameter = {
      id: `parameter_${parameters.length}`,
      name: 'orgUnitCode',
      type: 'text',
      required: true,
      defaultValue: 'UFO_01',
      hasDefaultValue: true,
      hasError: false,
    };

    setParameters([...parameters, defaultNewParameter]);
  };

  const onDelete = selectedParameterId => {
    const newParameterList = parameters.filter(p => p.id !== selectedParameterId);
    setParameters(newParameterList);
  };

  const onChange = (id, key, newValue) => {
    const newParameters = [...parameters];
    const index = parameters.findIndex(p => p.id === id);

    // validate name input
    if (key === 'name') {
      try {
        if (newValue === '') {
          throw new Error('Cannot be empty');
        }

        if (parameters.findIndex(p => p.name === newValue) !== -1) {
          throw new Error('Duplicated parameter name');
        }

        const regex = new RegExp('^[A-Za-z0-9_]+$');
        if (!regex.test(newValue)) {
          throw new Error('Contains space or special characters');
        }

        newParameters[index].hasError = false;
        newParameters[index].error = '';
      } catch (e) {
        newParameters[index].hasError = true;
        newParameters[index].error = e.message;
      }
    }

    newParameters[index][key] = newValue;
    setParameters(newParameters);
  };

  return { parameters, onAdd, onDelete, onChange };
};

export const CustomParamaterList = () => {
  const { parameters, onAdd, onDelete, onChange } = useParameters([
    {
      id: 'parameter_0',
      name: 'dataElementcode',
      type: 'text',
      required: true,
      defaultValue: 'UFO_01',
      hasDefaultValue: true,
      hasError: false,
    },
    {
      id: `parameter_1`,
      name: 'period',
      required: true,
      defaultValue: 'UFO_02',
      hasDefaultValue: true,
      hasError: false,
    },
  ]);

  return (
    <div>
      <BaseParameterList parameters={parameters} onDelete={onDelete} onChange={onChange} />
      <Button variant="outlined" startIcon={<AddIcon />} onClick={onAdd}>
        Add Random Parameter
      </Button>
      <pre>{JSON.stringify(parameters, null, 4)}</pre>
    </div>
  );
};

export const PreviewFilters = () => {
  const { parameters, onAdd, onChange } = useParameters([
    {
      id: 'parameter_0',
      name: 'dataElementCode',
      type: 'text',
      required: true,
      defaultValue: 'UFO_01',
      hasDefaultValue: true,
      inputFilterValue: null,
    },
    {
      id: 'parameter_1',
      name: 'value',
      type: 'number',
      required: true,
      defaultValue: 1,
      hasDefaultValue: true,
    },
    {
      id: `parameter_2`,
      name: 'startDate',
      type: 'date',
      required: true,
      defaultValue: new Date('2021-01-01'),
      hasDefaultValue: true,
      inputFilterValue: null,
    },
    {
      id: `parameter_3`,
      name: 'endDate',
      type: 'date',
      required: true,
      hasDefaultValue: false,
      inputFilterValue: new Date(),
    },
    {
      id: `parameter_4`,
      name: 'legacy',
      type: 'boolean',
      required: true,
      hasDefaultValue: false,
      inputFilterValue: false,
    },
  ]);

  return (
    <div>
      <BasePreviewFilters parameters={parameters} onChange={onChange} />
      <Button variant="outlined" startIcon={<AddIcon />} onClick={onAdd}>
        Add Random Parameter
      </Button>
      <pre>{JSON.stringify(parameters, null, 4)}</pre>
    </div>
  );
};
