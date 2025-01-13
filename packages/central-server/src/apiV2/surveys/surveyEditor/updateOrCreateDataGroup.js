export const updateOrCreateDataGroup = async (
  models,
  surveyId,
  { surveyCode, serviceType, dhisInstanceCode },
) => {
  const survey = surveyId ? await models.survey.findById(surveyId) : null;
  const existingDataGroup = survey ? await models.dataGroup.findOne({ code: survey.code }) : null;

  let dataGroup = existingDataGroup;
  if (existingDataGroup !== null) {
    dataGroup.code = surveyCode;
    if (serviceType) dataGroup.service_type = serviceType;
    if (dhisInstanceCode) {
      dataGroup.config = { dhisInstanceCode };
    }
  } else {
    dataGroup = await models.dataGroup.create({
      code: surveyCode,
      service_type: serviceType,
      config: { dhisInstanceCode },
    });
  }

  dataGroup.sanitizeConfig();
  await dataGroup.save();

  return dataGroup;
};
