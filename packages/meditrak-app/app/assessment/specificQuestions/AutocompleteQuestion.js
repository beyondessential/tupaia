/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { getQuestion, getAnswerForQuestion } from '../selectors';
import { Autocomplete } from '../../widgets/Autocomplete/Autocomplete';

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
    const { newlyCreatedOption } = this.state;
    const result = this.optionSet.options.find(
      option => str === option.value || str === option.label,
    );

    if (result) {
      return result.value;
    }

    return newlyCreatedOption &&
      (newlyCreatedOption.value === str || newlyCreatedOption.label === str)
      ? newlyCreatedOption.value
      : '';
  };

  getOptionLabel = str => {
    if (!str) return null;
    const { newlyCreatedOption } = this.state;
    const result = this.optionSet.options.find(
      option => str === option.value || str === option.label,
    );
    // if there's no label autocomplete should show the value instead

    if (result) {
      return result.label || result.value;
    }

    return newlyCreatedOption &&
      (newlyCreatedOption.label === str || newlyCreatedOption.value === str)
      ? newlyCreatedOption.value // when selecting 'Create xxx as a new option', we want to show xxx (the value) instead of 'Create xxx as a new option' in the field
      : '';
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

  filterOptions = searchTerm => {
    const checkMatchesAttributeFilters = this.getOptionAttributeFilters();
    return this.optionSet.options
      .filtered(
        `((label != null && label CONTAINS[c] "${searchTerm}") || label == null && value CONTAINS[c] "${searchTerm}")`,
      )
      .sorted('sortOrder')
      .filter(checkMatchesAttributeFilters);
  };

  filterOptionList = searchTerm => {
    const { createNew: allowCreatingOptions } = this.props;
    const filteredOptions = this.filterOptions(searchTerm);
    const dummyCreateNewOption = {
      label: `Create ${searchTerm} as a new option`,
      value: searchTerm,
    };
    const shouldCreateNewOption = allowCreatingOptions && !filteredOptions.length;
    const filteredResults = shouldCreateNewOption ? [dummyCreateNewOption] : filteredOptions;
    const newlyCreatedOption = shouldCreateNewOption ? dummyCreateNewOption : null;
    const newList = this.buildOptionList(filteredResults.slice(0, OPTIONS_PER_PAGE));
    this.setState({ filteredResults, optionList: newList, newlyCreatedOption });
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
  createNew: PropTypes.bool,
  onChangeAnswer: PropTypes.func.isRequired,
  optionSetId: PropTypes.string.isRequired,
  realmDatabase: PropTypes.any.isRequired,
};

AutocompleteQuestionComponent.defaultProps = {
  answer: '',
  createNew: false,
};

export const AutocompleteQuestion = connect((state, { id: questionId }) => {
  const question = getQuestion(state, questionId);
  const { autocomplete = {} } = question.config;
  const { attributes = {}, createNew = false } = autocomplete;
  const attributeAnswers = {};

  Object.entries(attributes).forEach(([key, config]) => {
    const attributeValue = getAnswerForQuestion(state, config.questionId);
    if (attributeValue !== undefined) {
      attributeAnswers[key] = attributeValue;
    }
  });

  return {
    attributeAnswers,
    createNew,
  };
})(AutocompleteQuestionComponent);
