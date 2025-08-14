import { ValidationError } from '@tupaia/utils';

export const validateSurveyCountries = async (models, surveyId, countryIds, projectId) => {
  if (!surveyId) return;

  const project = await models.project.findOne({ id: projectId });

  const projectCountries = await project.countries();
  const projectCountryNames = projectCountries.map(country => country.name);

  const countries = await models.country.find({ id: countryIds });

  const invalidCountryNames = countries
    .filter(({ name }) => !projectCountryNames.includes(name))
    .map(({ name }) => name);

  if (invalidCountryNames.length > 0) {
    throw new ValidationError(
      `The following countries are not part of the project: ${invalidCountryNames.join(', ')}`,
    );
  }
};
