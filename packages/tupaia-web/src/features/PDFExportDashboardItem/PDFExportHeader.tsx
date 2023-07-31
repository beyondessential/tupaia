/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { FlexCenter as BaseFlexCenter, FlexColumn as BaseFlexColumn } from '@tupaia/ui-components';

const FlexCenter = styled(BaseFlexCenter)`
  position: relative;
  padding: 50px;
`;

const FlexColumn = styled(BaseFlexColumn)`
  text-align: center;
`;

const Heading = styled.h1`
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  line-height: 1.4;
  font-size: 1.625rem;
  text-transform: capitalize;
  margin: 0;
`;

const Logo = styled.img.attrs({
  src: '/tupaia-logo-dark.svg',
})`
  top: 1.875rem;
  left: 1.2rem;
  position: absolute;
`;

export const PDFExportHeader = ({ children }: { children: ReactNode }) => {
  return (
    <FlexCenter>
      <Logo alt="Tupaia logo" width="74" height="30" />
      <FlexColumn>
        <Heading>{children}</Heading>
      </FlexColumn>
    </FlexCenter>
  );
};
