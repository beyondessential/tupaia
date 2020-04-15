/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { AutoComplete } from '../../components/Inputs';
import styled from 'styled-components';

export default {
  title: 'Inputs/Autocomplete',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const autoComplete = () => <AutoComplete />;
