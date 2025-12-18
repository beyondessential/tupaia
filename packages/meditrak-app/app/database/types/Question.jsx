import { Object as RealmObject } from 'realm';
import { updateListOfStrings } from './utilities';

const DEFAULT_ANSWERS = {
  Checkbox: 'No',
};

export class Question extends RealmObject {
  updateOptions(database, newOptions) {
    updateListOfStrings(database, this.options, newOptions, option => this.options.push(option));
  }

  getReduxStoreData() {
    const { id, text, imageData, type, options, detail, optionSet } = this;
    // don't want to try to access id if we don't have an optionSet
    const optionSetId = optionSet && optionSet.id;
    const data = {
      id,
      questionText: text,
      imageData,
      type,
      detailText: detail,
      optionSetId,
    };
    if (DEFAULT_ANSWERS[type]) data.answer = DEFAULT_ANSWERS[type];
    const optionsArray = options.map(option => option.toString());
    if (optionsArray.length > 0) data.options = optionsArray;
    return data;
  }
}

Question.schema = {
  name: 'Question',
  primaryKey: 'id',
  properties: {
    id: 'string',
    text: { type: 'string', default: 'Question not properly synchronised' },
    imageData: { type: 'string', optional: true },
    type: { type: 'string', default: 'Instruction' },
    options: { type: 'list', objectType: 'RealmString' },
    optionSet: { type: 'object', objectType: 'OptionSet', optional: true },
    detail: { type: 'string', optional: true },
  },
};

Question.requiredData = ['text', 'type'];

Question.construct = (database, data) => {
  const { options, optionSetId, ...restOfData } = data;
  let questionObject = restOfData;
  if (optionSetId) questionObject.optionSet = database.getOrCreate('OptionSet', optionSetId);
  questionObject = database.update('Question', questionObject);
  questionObject.updateOptions(database, options);
  return questionObject;
};
