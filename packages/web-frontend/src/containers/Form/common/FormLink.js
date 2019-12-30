/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import styled from 'styled-components';
import { WHITE } from '../../../styles';
import { isMobile } from '../../../utils/mobile';

export const FormLink = styled.a`
  color: ${WHITE};
  font-weight: ${isMobile() ? '800' : '500'};
  text-decoration: none;
  text-align: left;
`;
