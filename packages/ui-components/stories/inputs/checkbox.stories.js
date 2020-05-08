/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Checkbox } from '../../src/components/Inputs';
import styled from 'styled-components';

export default {
  title: 'Inputs/Checkbox',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const checkboxField = () => <Checkbox />;
