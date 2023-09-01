/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { TextField, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SHORT_ID, generateMongoId, generateShortId } from './generateId';

const LabelId = styled(Typography).attrs({
  variant: 'h1',
  color: 'textPrimary',
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
  color: 'textPrimary',
})`
  font-size: 0.875rem;
`;

interface CodeGeneratorProps {
  id: string;
  name: string;
  label: 'Asset ID';
  config: any;
  register: any;
}

// {"codeGenerator":{"type":"shortid","prefix":"CONTACT","length":"10"}}

export const CodeGeneratorQuestion = ({
  id,
  name,
  label = 'Asset ID',
  config,
  ...props
}: CodeGeneratorProps) => {
  const [code, setCode] = useState('');

  useEffect(() => {
    console.log(config['type']);
    const newCode =
      config?.codeGenerator?.type === SHORT_ID ? generateShortId(config) : generateMongoId();
    setCode(newCode);
    console.log(newCode);
  }, []);

  return (
    <>
      <LabelId variant="h1">{label}</LabelId>
      <BodyText>
        Please confirm this number is recorded on the asset. Note: We need to work out the workflow
        of if we are generating a QR code and when we print it
      </BodyText>
      <GeneratedCode>{code}</GeneratedCode>
      <TextField name={name} id={id} type="shortid" value={code} {...props} />
    </>
  );
};
