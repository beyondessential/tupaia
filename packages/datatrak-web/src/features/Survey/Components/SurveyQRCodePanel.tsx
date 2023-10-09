import React from 'react';
import styled from 'styled-components';
import { getAllSurveyComponents, useSurveyForm } from '..';

const QrCodeContainer = styled.div`
  background-color: white;
  height: 100%;
  width: 25%;
  max-width: 24rem;
  position: absolute;
  top: 0;
  right: 0;
`;

export const SurveyQRCodePanel = () => {
  const { surveyScreens } = useSurveyForm();
  const allSurveyScreenComponents = getAllSurveyComponents(surveyScreens);

  const qrCodeQuestions = allSurveyScreenComponents?.filter(
    component => component.config?.entity?.generateQrCode && component.config?.entity?.createNew,
  );
  if (!qrCodeQuestions?.length) return null;
  console.log(qrCodeQuestions);
  return <QrCodeContainer></QrCodeContainer>;
};
