/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { takeScrollControl, releaseScrollControl } from '../actions';
import { getQuestion } from '../selectors';
import { Autocomplete } from '../../widgets/Autocomplete/Autocomplete';

const OPTIONS_PER_PAGE = 10;

const UserQuestionComponent = props => {
  const { selectedUserId, users, onSelectUser, scrollIntoFocus } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [maxResults, setMaxResults] = useState(OPTIONS_PER_PAGE);

  const userList = users?.map(user => user.name) ?? [];

  const generateOptionList = () => {
    if (!searchTerm) {
      return userList.slice(0, maxResults);
    }
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const usersThatStartWithSearchTerm = userList.filter(user =>
      user.toLowerCase().startsWith(lowercaseSearchTerm),
    );

    const usersThatContainSearchTerm = userList.filter(user =>
      user.toLowerCase().includes(lowercaseSearchTerm),
    );

    // return first the users that start with the search term, then the users that contain the search term
    return [...usersThatStartWithSearchTerm, ...usersThatContainSearchTerm].slice(0, maxResults);
  };

  const optionList = generateOptionList();

  const getSelectedUser = () => users.find(user => user.id === selectedUserId);

  const selectedUser = getSelectedUser();

  const handleEndReached = () => {
    // If we've reached the end of the list, don't try to load more
    if (users.length <= OPTIONS_PER_PAGE || maxResults >= users.length) return;

    const newMaxResults = maxResults + OPTIONS_PER_PAGE;

    setMaxResults(newMaxResults);
  };

  const handleSelectOption = option => {
    const newSelectedUser = users.find(user => user.name === option);
    onSelectUser(newSelectedUser?.id ?? null);
  };

  const handleChangeSearchTerm = newSearchTerm => {
    setSearchTerm(newSearchTerm);
    setMaxResults(OPTIONS_PER_PAGE);
  };

  return (
    <View>
      <Autocomplete
        placeholder="Search users..."
        selectedOption={selectedUser?.name ?? null}
        handleSelectOption={handleSelectOption}
        options={optionList}
        handleEndReached={handleEndReached}
        handleChangeInput={handleChangeSearchTerm}
        scrollIntoFocus={scrollIntoFocus}
        endReachedOffset={0.3}
      />
    </View>
  );
};

UserQuestionComponent.propTypes = {
  onSelectUser: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  selectedUserId: PropTypes.string,
  scrollIntoFocus: PropTypes.func.isRequired,
};

UserQuestionComponent.defaultProps = {
  selectedUserId: null,
};

const mapStateToProps = (
  state,
  { id: questionId, answer: selectedUserId, realmDatabase: database },
) => {
  const { code: countryCode } = database.getCountry(state.country.selectedCountryId);
  const question = getQuestion(state, questionId);

  const users = database.getUsersByPermissionGroupAndCountry(
    countryCode,
    question.config?.user?.permissionGroup,
  );

  return {
    selectedUserId,
    users,
  };
};

const mapDispatchToProps = (dispatch, { onChangeAnswer }) => ({
  onSelectUser: userId => onChangeAnswer(userId),
  onClear: () => onChangeAnswer(null),
  takeScrollControl: () => dispatch(takeScrollControl()),
  releaseScrollControl: () => dispatch(releaseScrollControl()),
});

export const UserQuestion = connect(mapStateToProps, mapDispatchToProps)(UserQuestionComponent);
