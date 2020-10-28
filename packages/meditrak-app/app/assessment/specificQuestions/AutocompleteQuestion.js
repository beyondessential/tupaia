/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { getQuestion, getAnswerForQuestion } from '../selectors';
import { Autocomplete } from '../../widgets/Autocomplete/Autocomplete';
import { constructRecord } from '../../database/constructRecord';

const OPTIONS_PER_PAGE = 6;
export class AutocompleteQuestionComponent extends React.Component {
  constructor(props) {
    super(props);

    this.optionSet = props.realmDatabase.getOptionSetById(props.optionSetId);
    const checkMatchesAttributeFilters = this.getOptionAttributeFilters();
    const filteredResults = this.optionSet.options
      .sorted('sortOrder')
      .filter(checkMatchesAttributeFilters);

    this.state = {
      filteredResults,
      optionList: this.buildOptionList(filteredResults.slice(0, OPTIONS_PER_PAGE)),
    };
  }

  getOptionValue = str => {
    // Don't want to return an option with a null label (which is valid data)
    // if we are passed null str (which indicates no option selected)
    if (!str) return null;
    return this.optionSet.options.find(option => str === option.value || str === option.label)
      .value;
  };

  getOptionLabel = str => {
    if (!str) return null;
    const result = this.optionSet.options.find(
      option => str === option.value || str === option.label,
    );
    // if there's no label autocomplete should show the value instead
    return result.label || result.value;
  };

  buildOptionList = options => options.map(option => option.label || option.value);

  getOptionAttributeFilters = () => {
    const { attributeAnswers } = this.props;

    return option =>
      attributeAnswers
        ? Object.entries(attributeAnswers).every(([key, answer]) => {
            const { attributes: optionAttributes } = option.toJson();
            return optionAttributes[key] === answer;
          })
        : true;
  };

  filterOptionList = searchTerm => {
    const checkMatchesAttributeFilters = this.getOptionAttributeFilters();
    const filteredResults = this.optionSet.options
      .filtered(
        `((label != null && label CONTAINS[c] "${searchTerm}") || label == null && value CONTAINS[c] "${searchTerm}")`,
      )
      .sorted('sortOrder')
      .filter(checkMatchesAttributeFilters);

    const newList = this.buildOptionList(filteredResults.slice(0, OPTIONS_PER_PAGE));
    this.setState({ filteredResults, optionList: newList });
  };

  fetchMoreResults = () => {
    const { optionList, filteredResults } = this.state;
    const nextOptions = this.buildOptionList(
      filteredResults.slice(optionList.length, optionList.length + OPTIONS_PER_PAGE),
    );
    if (nextOptions.length === 0) return;
    this.setState({ optionList: [...optionList, ...nextOptions] });
  };

  render() {
    const { optionList } = this.state;
    const { answer, onChangeAnswer } = this.props;
    return (
      <View>
        <Autocomplete
          placeholder="Search options..."
          selectedOption={this.getOptionLabel(answer)}
          handleSelectOption={option => onChangeAnswer(this.getOptionValue(option))}
          options={optionList}
          handleEndReached={this.fetchMoreResults}
          handleChangeInput={this.filterOptionList}
          endReachedOffset={0.3}
        />
      </View>
    );
  }
}

AutocompleteQuestionComponent.propTypes = {
  answer: PropTypes.string,
  attributeAnswers: PropTypes.object,
  onChangeAnswer: PropTypes.func.isRequired,
  optionSetId: PropTypes.string.isRequired,
  realmDatabase: PropTypes.any.isRequired,
};

AutocompleteQuestionComponent.defaultProps = {
  answer: '',
};

export const AutocompleteQuestion = connect((state, { id: questionId }) => {
  const question = getQuestion(state, questionId);
  const { autocomplete } = question.config;
  const attributeAnswers = {};

  if (autocomplete) {
    const { attributes = {} } = autocomplete;
    Object.entries(attributes).forEach(([key, config]) => {
      const attributeValue = getAnswerForQuestion(state, config.questionId);
      if (attributeValue !== undefined) {
        attributeAnswers[key] = attributeValue;
      }
    });
  }

  return {
    attributeAnswers,
  };
})(AutocompleteQuestionComponent);
