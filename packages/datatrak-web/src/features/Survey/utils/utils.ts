import { QuestionType } from '@tupaia/types';
import { SurveyScreen, SurveyScreenComponent } from '../../../types';

const validateSurveyComponent = component => {
  if (component.type === QuestionType.PrimaryEntity && !component.config?.entity?.createNew) {
    (component.validationCriteria ??= {}).mandatory = true;
  }
  return component;
};

export const READ_ONLY_QUESTION_TYPES = [
  QuestionType.Condition,
  QuestionType.Arithmetic,
  QuestionType.Instruction,
  QuestionType.CodeGenerator,
];

export const getSurveyScreenNumber = (screens, screen) => {
  if (!screen) return null;
  const { surveyScreenComponents, id } = screen;
  const nonInstructionScreens =
    screens?.filter(screen =>
      screen.surveyScreenComponents.some(component => component.type !== QuestionType.Instruction),
    ) ?? [];

  const screenNumber = surveyScreenComponents.some(
    component => component.type !== QuestionType.Instruction,
  )
    ? nonInstructionScreens.findIndex(nonInstructionScreen => nonInstructionScreen.id === id) + 1
    : null;

  return screenNumber;
};

export const getAllSurveyComponents = (surveyScreens?: SurveyScreen[]) => {
  return (
    surveyScreens?.flatMap(({ surveyScreenComponents }) =>
      validateSurveyComponent(surveyScreenComponents),
    ) ?? []
  );
};

export const getErrorsByScreen = (
  errors: Record<string, Record<string, string>>,
  visibleScreens?: SurveyScreen[],
) => {
  return (
    Object.entries(errors).reduce((acc, [questionName, error]) => {
      const screenIndex = visibleScreens?.findIndex(({ surveyScreenComponents }) =>
        surveyScreenComponents.find(question => question.questionId === questionName),
      );

      if (screenIndex === undefined || screenIndex === -1) return acc;
      const screenNum = screenIndex + 1;
      return {
        ...acc,
        [screenNum]: {
          ...acc[screenNum],
          [questionName]: error,
        },
      };
    }, {}) ?? {}
  );
};

export const getParentQuestionId = (question: SurveyScreenComponent) => {
  return question?.config?.entity?.filter?.parentId?.questionId;
};

// Get the parent question ids recursively for the primary entity question
export const getPrimaryEntityParentQuestionIds = (
  entityQuestion: SurveyScreenComponent,
  questions: SurveyScreenComponent[],
) => {
  const parentQuestionId = getParentQuestionId(entityQuestion);
  const parentQuestion =
    parentQuestionId && questions.find(question => question.id === parentQuestionId);

  return parentQuestion
    ? [parentQuestionId, ...getPrimaryEntityParentQuestionIds(parentQuestion, questions)]
    : [];
};
