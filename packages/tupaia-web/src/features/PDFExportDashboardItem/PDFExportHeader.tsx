/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
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
  aspect-ratio: 1;
  height: 3.5cm;
  object-fit: contain;
`;

const Heading = styled.h1`
  font-size: 1.625rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  inline-size: 100%;
  line-height: 1.4;
  margin: 0;
  text-align: center;
`;

interface PDFExportHeaderProps {
  imageUrl?: string;
  imageDescription?: string;
  children: ReactNode;
}

export const PDFExportHeader = ({
  imageUrl = '/tupaia-logo-dark.svg',
  imageDescription = 'Tupaia logo',
  children,
}: PDFExportHeaderProps) => {
  return (
    <Container>
      <HeaderImage alt={imageDescription} src={imageUrl} width="132" height="132" />
      <Heading>{children}</Heading>
    </Container>
  );
};
