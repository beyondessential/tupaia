import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { generateMongoId, generateShortId, SHORT_ID } from '../../utilities';
import { Text } from '../../widgets';

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
