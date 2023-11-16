/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';

export const Media = styled.div<{
  $backgroundImage?: string;
}>`
  position: relative;
  min-height: 12.5rem;
  width: 100%;
  padding-bottom: 25%;
  background: ${({ $backgroundImage }) =>
    `linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("${$backgroundImage}")`};
  background-size: cover;
  background-position: center;
`;
