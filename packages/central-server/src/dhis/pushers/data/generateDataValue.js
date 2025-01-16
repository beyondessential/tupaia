export const generateDataValue = async (models, answer) => {
  const { question_id: questionId, text: answerText } = answer;
  const question = await models.question.findById(questionId);
  const value =
    answer.type === models.answer.types.ENTITY
      ? await getEntityCodeFromId(models, answerText)
      : answerText;
  return {
    code: question.code,
    value,
  };
};

const getEntityCodeFromId = async (models, entityId) => {
  const entity = await models.entity.findById(entityId);
  if (!entity) {
    throw new Error(`No entity matching id ${entityId}`);
  }
  return entity.code;
};
