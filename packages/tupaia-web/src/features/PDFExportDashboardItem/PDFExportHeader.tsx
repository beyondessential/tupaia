/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  gap: 5mm;
  grid-template-columns: 1fr 2fr 1fr;
  vertical-align: center;
  width: 100%;
`;

const HeaderImage = styled.img.attrs({})`
  max-width: 3.5cm;
`;

const Heading = styled.h1`
  block-size: 100%;
  font-size: 1.625rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  inline-size: 100%;
  line-height: 1.4;
  margin: 0;
  text-align: center;
`;

export const PDFExportHeader = ({
  headerImageUrl = '/tupaia-logo-dark.svg',
  headerImageDescription = 'Tupaia logotype',
  children,
}: {
  headerImageUrl?: string;
  headerImageDescription?: string;
  children: ReactNode;
}) => {
  return (
    <Container>
      <HeaderImage alt={headerImageDescription} src={headerImageUrl} />
      <Heading>{children}</Heading>
    </Container>
  );
};
