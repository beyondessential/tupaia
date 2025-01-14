import { getQrCodeGenerationQuestions } from '../../helpers';
import { getAnswers } from '../../selectors';

export const generateQrCodes = (getState, questions, newEntities) => {
  const qrCodeGenerationQuestions = getQrCodeGenerationQuestions(questions);
  const answers = getAnswers(getState());
  const qrCodes = [];
  qrCodeGenerationQuestions.forEach(question => {
    const entityId = answers[question.id];
    const entity = newEntities.find(({ id }) => id === entityId);
    if (entity) {
      // TODO: Consolidate id prefixing into a common util (RN-968)
      const qrCodeData = `entity-${entityId}`;
      qrCodes.push({ data: qrCodeData, name: entity.name });
    }
  });

  return qrCodes;
};
