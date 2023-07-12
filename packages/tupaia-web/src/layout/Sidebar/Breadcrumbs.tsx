/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import { MOBILE_BREAKPOINT } from '../../constants';

export const Breadcrumbs = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 100%;
  max-width: 220px;
  background: #efefefaa;
  height: 15px;
  z-index: 1;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;
