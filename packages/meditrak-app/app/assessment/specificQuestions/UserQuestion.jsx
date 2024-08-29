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

  const sortList = list => list.sort((a, b) => a.localeCompare(b));

  const userList = sortList(users?.map(user => user.name) ?? []);

  const generateSearchRegexp = () => {
    if (!searchTerm) {
      return null;
    }
    // handle apostrophe AND single quote characters
    if (searchTerm.includes("'")) {
      return `(${searchTerm.replace("'", "\\'")})|(${searchTerm.replace("'", '\\‘')})`;
    }

    if (searchTerm.includes('’')) {
      return `(${searchTerm.replace('’', '\\’')})|(${searchTerm.replace('’', "\\'")})`;
    }

    return searchTerm;
  };

  const generateOptionList = () => {
    if (!searchTerm) {
      return userList.slice(0, maxResults);
    }
    const searchRegexp = generateSearchRegexp();
    const startsWithSearchTerm = new RegExp(`^${searchRegexp}`, 'gi');
    const containsSearchTerm = new RegExp(searchRegexp, 'gi');

    const usersThatStartWithSearchTerm = userList.filter(user => startsWithSearchTerm.test(user));

    const usersThatContainSearchTerm = userList.filter(
      user => containsSearchTerm.test(user) && !usersThatStartWithSearchTerm.includes(user),
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
    if (!option) {
      onSelectUser(null);
      return;
    }
    const newSelectedUser = users.find(user => user.name === option);
    if (!newSelectedUser) {
      throw new Error(`Cannot find user in database: ${option}`);
    }
    onSelectUser(newSelectedUser.id);
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
    true,
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
