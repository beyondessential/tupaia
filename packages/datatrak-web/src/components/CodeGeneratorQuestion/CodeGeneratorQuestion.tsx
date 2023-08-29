/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect } from 'react';
import { SHORT_ID, generateShortId, generateMongoId } from './generateId';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';

// {"codeGenerator":{"type":"shortid","prefix":"CONTACT","length":"10"}}

const LabelId = styled(Typography).attrs({
  variant: 'h1',
  color: 'textSecondary',
})`
  font-size: 1rem;
  margin-bottom: 0.4 rem;
`;

const BodyText = styled(Typography).attrs({
  color: 'textSecondary',
})`
  font-size: 0.875rem;
  margin-bottom: 1.125rem;
`;

const GeneratedCode = styled(Typography).attrs({
  variant: 'h1',
  color: 'textSecondary',
})``;

interface CodeGeneratorProps {
  id: string;
  name: string;
  label: string;
  config: any;
}

export const CodeGeneratorQuestion = ({
  id,
  name,
  label = 'Asset ID',
  config,
}: CodeGeneratorProps) => {
  const [code, setCode] = useState('');
  useEffect(() => {
    console.log('mount', config);
    const newCode =
      config.codeGenerator.type === SHORT_ID ? generateShortId(config) : generateMongoId();
    setCode(newCode);
  }, [config, id]);

  return (
    <>
      <LabelId variant="h1">{label}</LabelId>
      <BodyText>
        Please confirm this number is recorded on the asset. Note: We need to work out the workflow
        of if we are generating a QR code and when we print it
      </BodyText>
      <GeneratedCode>{code}</GeneratedCode>
      <input name={name} id={id} type="hidden" value={code} />
    </>
  );
};
