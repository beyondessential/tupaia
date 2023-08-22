/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const CellLink = styled(Button).attrs({
  component: Link,
})`
  color: inherit;
  text-decoration: none;
  text-transform: none;
`;
