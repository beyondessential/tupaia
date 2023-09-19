import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Text } from '../../widgets';
import { generateShortId, generateMongoId, SHORT_ID, MONGO_ID } from '../../utilities';

export class CodeGeneratorQuestion extends PureComponent {
  componentDidMount() {
    if (!this.props.answer) {
      this.props.onChangeAnswer(this.generateCode());
    }
  }

  generateCode() {
    const { config } = this.props;
    return config.codeGenerator.type === SHORT_ID ? generateShortId(config) : generateMongoId();
  }

  render() {
    return (
      <View>
        <Text>{this.props.answer}</Text>
      </View>
    );
  }
}

CodeGeneratorQuestion.propTypes = {
  answer: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};
