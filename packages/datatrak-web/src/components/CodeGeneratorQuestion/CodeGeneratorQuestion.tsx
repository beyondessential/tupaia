/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { TextField, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { SHORT_ID, generateMongoId, generateShortId } from './generateId';
import { SurveyQuestionInputProps } from '../../types';

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
  margin-bottom: 1.13rem;
`;

const GeneratedCode = styled(Typography).attrs({
  variant: 'h1',
  color: 'textPrimary',
})`
  font-size: 0.88rem;
  margin-bottom: 0.6rem;
`;

const Line = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.palette.divider};
  width: 58.1rem;
`;

type CodeGeneratorProps = SurveyQuestionInputProps & {
  id: string;
  name: string;
  label: string;
  config: any;
  register: any;
};

// {"codeGenerator":{"type":"shortid","prefix":"CONTACT","length":"10"}}

export const CodeGeneratorQuestion = ({
  id,
  name,
  label,
  config,
  controllerProps: { onChange, value, ref },
  ...props
}: CodeGeneratorProps) => {
  useEffect(() => {
    console.log(config);
    const newCode =
      config.codeGenerator.type === SHORT_ID ? generateShortId(config) : generateMongoId();
    if (!value) {
      onChange(newCode);
    }
  }, []);

  return (
    <div>
      <LabelId variant="h1">{label}</LabelId>
      <BodyText>
        Please confirm this number is recorded on the asset. <br></br>
        Note: We need to work out the workflow of if we are generating a QR code and when we print
        it
      </BodyText>
      <GeneratedCode>{value}</GeneratedCode>
      <Line></Line>
      <TextField
        {...props}
        name={name}
        id={id}
        type="hidden"
        inputRef={ref}
        onChange={onChange}
        value={value}
      />
    </div>
  );
};
