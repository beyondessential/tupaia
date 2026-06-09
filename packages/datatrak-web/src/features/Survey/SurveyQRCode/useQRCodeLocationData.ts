import { useLocation } from 'react-router';

export const useQRCodeLocationData = () => {
  const { state } = useLocation();
  if (!state) return null;

  const { surveyResponse } = state as { surveyResponse: string };
  if (!surveyResponse) return null;

  const { qrCodeEntitiesCreated } = JSON.parse(surveyResponse);
  if (!qrCodeEntitiesCreated?.length) return null;

  return qrCodeEntitiesCreated;
};
