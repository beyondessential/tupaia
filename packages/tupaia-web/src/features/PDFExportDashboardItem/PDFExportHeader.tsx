/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  align-items: center;
  display: grid;
  gap: 5mm;
  grid-template-columns: 1fr 2fr 1fr;
  width: 100%;
`;

const HeaderImage = styled.img`
  max-height: 3cm;
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
  imageUrl = '/tupaia-logo-dark.svg',
  imageDescription = 'Tupaia logotype',
  children,
}: {
  imageUrl?: string;
  imageDescription?: string;
  children: ReactNode;
}) => {
  return (
    <Container>
      <HeaderImage alt={imageDescription} src={imageUrl} />
      <Heading>{children}</Heading>
    </Container>
  );
};
