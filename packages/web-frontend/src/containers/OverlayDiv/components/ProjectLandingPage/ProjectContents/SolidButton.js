/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import styled from 'styled-components';

export const SolidButton = styled.button`
  color: white;
  background: #ee612e;
  border-radius: 3px;
  border: none;
  height: 42px;
  padding: 0 29px;
  margin-right: 16px;

  :active {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #ee612e;
  }
`;
