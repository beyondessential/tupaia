/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { TextField, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { SHORT_ID, generateMongoId, generateShortId } from './generateId';
import { SurveyQuestionInputProps } from '../../../types';

const LabelId = styled(Typography)`
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 0.4rem;
`;

const BodyText = styled(Typography).attrs({
  color: 'textSecondary',
})`
  font-size: 0.875rem;
  margin-bottom: 1.13rem;
`;

const GeneratedCode = styled(Typography)`
  font-size: 0.88rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-bottom: 0.6rem;
`;

const Line = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.palette.divider};
  width: 100%;
`;

export const CodeGeneratorQuestion = ({
  id,
  name,
  label,
  config,
  controllerProps: { onChange, value, ref },
  ...props
}: SurveyQuestionInputProps) => {
  useEffect(() => {
    if (!value) {
      const newCode =
        config.codeGenerator.type === SHORT_ID ? generateShortId(config) : generateMongoId();
      onChange(newCode);
    }
  }, []);

  return (
    <div>
      <LabelId variant="h3">{label}</LabelId>
      <BodyText>
        Please confirm this number is recorded on the asset. <br></br>
        Note: We need to work out the workflow of if we are generating a QR code and when we print
        it
      </BodyText>
      <GeneratedCode>{value}</GeneratedCode>
      <Line></Line>
      <TextField
        {...props}
        name={name!}
        id={id}
        type="hidden"
        inputRef={ref}
        onChange={onChange}
        value={value}
      />
    </div>
  );
};
