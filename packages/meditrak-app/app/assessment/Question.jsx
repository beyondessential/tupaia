import { connect } from 'react-redux';

import { getQuestionState } from './selectors';
import { changeAnswer, validateComponent } from './actions';
import { DumbQuestion } from './DumbQuestion';
import {
  BinaryQuestion,
  CheckboxQuestion,
  DateQuestion,
  DateTimeQuestion,
  FreeTextQuestion,
  GeolocateQuestion,
  AutocompleteQuestion,
  Instruction,
  NumberQuestion,
  PhotoQuestion,
  RadioQuestion,
  UnsupportedQuestion,
  DaysSinceQuestion,
  MonthsSinceQuestion,
  YearsSinceQuestion,
  EntityQuestion,
  FileQuestion,
  ArithmeticQuestion,
  ConditionQuestion,
  CodeGeneratorQuestion,
  UserQuestion,
} from './specificQuestions';

const QUESTION_TYPES = {
  Binary: BinaryQuestion,
  Checkbox: CheckboxQuestion,
  Date: DateQuestion,
  DateTime: DateTimeQuestion,
  FreeText: FreeTextQuestion,
  Geolocate: GeolocateQuestion,
  Autocomplete: AutocompleteQuestion,
  Instruction,
  Number: NumberQuestion,
  Photo: PhotoQuestion,
  Radio: RadioQuestion,
  DaysSince: DaysSinceQuestion,
  MonthsSince: MonthsSinceQuestion,
  YearsSince: YearsSinceQuestion,
  SubmissionDate: DateQuestion,
  DateOfData: DateQuestion,
  Entity: EntityQuestion,
  PrimaryEntity: EntityQuestion,
  CodeGenerator: CodeGeneratorQuestion,
  Arithmetic: ArithmeticQuestion,
  Condition: ConditionQuestion,
  File: FileQuestion,
  User: UserQuestion,
};

const TYPES_CONTROLLING_QUESTION_TEXT = ['Instruction', 'Checkbox'];

const mapStateToProps = (
  state,
  { componentIndex, screenIndex, type, questionText, textInputProps, optionSetId, realmDatabase },
) => {
  const { answer, validationErrorMessage } = getQuestionState(state, screenIndex, componentIndex);
  return {
    answer,
    optionSetId,
    realmDatabase,
    textInputProps,
    validationErrorMessage,
    hasValidationErrorMessage: !!validationErrorMessage,
    text: TYPES_CONTROLLING_QUESTION_TEXT.includes(type) ? null : questionText,
    SpecificQuestion: QUESTION_TYPES[type] || UnsupportedQuestion,
  };
};

const mergeProps = ({ hasValidationErrorMessage, ...restOfStateProps }, { dispatch }, ownProps) => {
  const { id, screenIndex, componentIndex, validationCriteria, isVisible } = ownProps;
  return {
    ...ownProps,
    ...restOfStateProps,
    onChangeAnswer: newAnswer => {
      dispatch(changeAnswer(id, newAnswer));
      // If this question has a validation error message, validate it every time the answer is
      // changed so the user gets immediate feedback when they have fixed the issue
      if (isVisible && hasValidationErrorMessage) {
        dispatch(validateComponent(screenIndex, componentIndex, validationCriteria, newAnswer));
      }
    },
  };
};

export const Question = connect(mapStateToProps, null, mergeProps)(DumbQuestion);
