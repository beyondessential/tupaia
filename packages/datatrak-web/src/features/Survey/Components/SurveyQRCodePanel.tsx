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
  const { surveyScreens, formData } = useSurveyForm();
  const allSurveyScreenComponents = getAllSurveyComponents(surveyScreens);

  // Only generate QR Codes for new entities
  const qrCodeQuestions = allSurveyScreenComponents
    ?.filter(
      component => component.config?.entity?.generateQrCode && component.config?.entity?.createNew,
    )
    .map(component => {
      const { config, questionId } = component;
      return { config, questionId };
    });
  if (!qrCodeQuestions?.length) return null;

  return <QrCodeContainer></QrCodeContainer>;
};
