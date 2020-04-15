/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { AutoComplete } from '../../components/Inputs';

export default {
  title: 'Inputs/Autocomplete',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const autoComplete = () => <AutoComplete />;
