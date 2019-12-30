/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import styled from 'styled-components';
import { BLUE, DARK_BLUE } from '../../../styles';
import { isMobile } from '../../../utils';

export const BODY_TEXT_COLOR = '#333646';
export const INFO_BLUE = BLUE;

export const FlexContainer = styled.div`
  display: flex;
  flex-direction: ${isMobile() ? 'column' : 'row'};
  align-items: stretch;
  align-content: stretch;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 18px;
  line-height: 1.56;
  text-align: left;
  padding: 10px ${isMobile() ? '16' : '30'}px;
  color: ${BODY_TEXT_COLOR};
`;

export const CenterContent = styled.div`
  flex: 8;
`;
export const SideBar = styled.div`
  flex: 1;
  flex-basis: 80px;
`;

export const H2 = styled.h2`
  font-size: 26px;
  line-height: 1.08;
  color: ${DARK_BLUE};
`;
