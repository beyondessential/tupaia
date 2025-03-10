import { generateMongoId } from '../../../utilities';
import { getOptionCreationAutocompleteQuestions } from '../../helpers';
import { getAnswers } from '../../selectors';

const buildOption = (database, optionSetId, value) => {
  const optionSet = database.getOptionSetById(optionSetId);
  const largestSortOrder = optionSet.getLargestSortOrder();
  return {
    id: generateMongoId(),
    value,
    sortOrder: largestSortOrder + 1,
    optionSet,
  };
};

export const createNewOptions = (getState, database, questions) => {
  const autocompleteQuestions = getOptionCreationAutocompleteQuestions(questions);
  const answers = getAnswers(getState());
  const createdOptions = [];
  autocompleteQuestions
    .filter(({ id: questionId }) => answers[questionId] !== undefined)
    .forEach(question => {
      const { id: questionId, optionSetId } = question;
      const answer = answers[questionId];
      const optionSet = database.getOptionSetById(optionSetId);
      // Check if the selected option isn't an existing option in the option set
      if (!optionSet.doesOptionValueExist(answer)) {
        createdOptions.push(buildOption(database, optionSetId, answer));
      }
    });

  return createdOptions;
};
