import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useEntityByCode, useSurvey } from '../../../api';
import { Tooltip } from '@tupaia/ui-components';

const Paragraph = styled.p`
  display: block;
  margin-block: 0;
  text-align: center;
  text-wrap: balance;
`;

const HeaderText = styled.p`
  font-size: 0.875rem;
  line-height: 1.5;
  margin-block: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SurveyName = styled(HeaderText).attrs({ as: 'h1' })`
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: 600;
`;

const CountryName = styled(HeaderText)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: 400;
`;

export const SurveyDisplayName = () => {
  const { surveyCode, countryCode } = useParams();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);

  if (!survey?.name) return null;

  return (
    <>
      <Tooltip
        placement="bottom"
        title={
          <>
            <Paragraph style={{ fontWeight: 600 }}>{survey?.name}</Paragraph>
            <Paragraph>{country?.name}</Paragraph>
          </>
        }
      >
        {/* Meaningless div, but Tooltip expects a single child */}
        <div>
          <SurveyName>{survey?.name}</SurveyName>
          <CountryName>{country?.name}</CountryName>
        </div>
      </Tooltip>
    </>
  );
};
