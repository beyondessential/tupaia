/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import styled from 'styled-components';
import { JsonEditor } from '../src/components/JsonEditor';

export default {
  title: 'Inputs/JsonEditor',
};

const PanelTabPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  > div {
    width: 50%;
    height: 100px;
  }

  .jsoneditor {
    border: none;
    min-height: 700px;
  }
`;

const value = {
  dataElements: ['dataElement_A_1'],
  dataGroups: ['dataGroup_A'],
  indicators: ['indicator is not required'],
};

export const Simple = () => {
  return (
    <PanelTabPanel>
      <JsonEditor value={value} mode="code" mainMenuBar={false} />
    </PanelTabPanel>
  );
};

const schema = {
  additionalProperties: false,
  properties: {
    dataElements: {
      type: 'array',
      items: {
        const: 'abc',
      },
      minItems: 1,
      uniqueItems: true,
    },
    dataGroups: {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    },
  },
  required: ['dataElements', 'dataGroups'],
};

export const SchemaValidation = () => {
  return (
    <PanelTabPanel>
      <JsonEditor
        value={value}
        mode="code"
        mainMenuBar={false}
        schema={schema}
        onValidationError={error => {
          console.log(error);
        }}
      />
    </PanelTabPanel>
  );
};
