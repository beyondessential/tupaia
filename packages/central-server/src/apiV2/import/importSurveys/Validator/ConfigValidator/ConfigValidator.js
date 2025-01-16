import { ANSWER_TYPES } from '../../../../../database/models/Answer';
import { BaseValidator } from '../BaseValidator';
import { IsEmptyValidator } from './IsEmptyValidator';
import { CodeGeneratorConfigValidator } from './CodeGeneratorConfigValidator';
import { EntityConfigValidator } from './EntityConfigValidator';
import { ArithmeticConfigValidator } from './ArithmeticConfigValidator';
import { ConditionConfigValidator } from './ConditionConfigValidator';
import { UserConfigValidator } from './UserConfigValidator';
import { TaskConfigValidator } from './TaskConfigValidator';

const { CODE_GENERATOR, ENTITY, PRIMARY_ENTITY, ARITHMETIC, CONDITION, USER, TASK } = ANSWER_TYPES;

export class ConfigValidator extends BaseValidator {
  constructor(...constructorArgs) {
    super(...constructorArgs);
    this.constructorArgs = constructorArgs;
  }

  async validate(rowIndex, constructError) {
    const questionType = this.getQuestion(rowIndex).type;
    const Validator = this.getValidator(questionType);

    return new Validator(...this.constructorArgs).validate(rowIndex, constructError);
  }

  getValidator = questionType => {
    switch (questionType) {
      case ENTITY:
      case PRIMARY_ENTITY:
        return EntityConfigValidator;
      case CODE_GENERATOR:
        return CodeGeneratorConfigValidator;
      case ARITHMETIC:
        return ArithmeticConfigValidator;
      case CONDITION:
        return ConditionConfigValidator;
      case USER:
        return UserConfigValidator;
      case TASK:
        return TaskConfigValidator;
      default:
        return IsEmptyValidator;
    }
  };
}
