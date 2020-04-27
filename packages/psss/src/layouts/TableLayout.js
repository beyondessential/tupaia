/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  background: white;
  border: 2px dashed black;
  height: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const TableLayout = ({ metaData }) => {
  return (
    <Section>
      <h3>Table Layout: {metaData.resource}</h3>
    </Section>
  );
};
