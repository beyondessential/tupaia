/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { periodToMoment } from '@tupaia/utils';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  width: 334px;
  height: 1em;
  margin-top: 5px;
  padding-left: 8px;
  padding-top: 5px;
  padding-bottom: 5px;
  // Box
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.3);
  // Text
  color: #ffffff;
  font-weight: normal;
  font-size: 0.8em;
  line-height: 1;
  text-align: left;
`;

interface LastUpdatedProps {
  latestAvailable?: string;
}

export const LastUpdated = ({ latestAvailable }: LastUpdatedProps) => {
  return latestAvailable ? (
    <Wrapper>Latest overlay data: {periodToMoment(latestAvailable).format('DD/MM/YYYY')}</Wrapper>
  ) : null;
};
