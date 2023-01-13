/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import styled from 'styled-components';
import { SQLEditor } from '../src/components/SQLEditor';

export default {
  title: 'Inputs/SQLEditor',
};

const PanelTabPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  > div {
    width: 50%;
    height: 100px;
  }
`;

export const Simple = () => {
  return (
    <PanelTabPanel>
      <SQLEditor mode="code" />
    </PanelTabPanel>
  );
};
