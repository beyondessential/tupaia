import React, { useState } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { takeScrollControl, releaseScrollControl } from '../actions';
import { getQuestion } from '../selectors';
import { Autocomplete } from '../../widgets/Autocomplete/Autocomplete';

const OPTIONS_PER_PAGE = 10;

/** @param {string} str */
const normalize = str =>
  str
    .replace(/[‘’]/g, "'") // Treat educated quotes as equivalent to straight quotes
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const UserQuestionComponent = ({ onSelectUser, scrollIntoFocus, selectedUserId, users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxResults, setMaxResults] = useState(OPTIONS_PER_PAGE);

  const sortedNames = users?.map(user => user.name).sort((a, b) => a.localeCompare(b)) ?? [];

  const generateOptionList = () => {
    if (!searchTerm) return sortedNames.slice(0, maxResults);

    const normalizedSearchTerm = normalize(searchTerm);
    const prefixMatches = [];
    const substringMatches = [];
    for (const name of sortedNames) {
      const normalizedName = normalize(name);
      if (normalizedName.startsWith(normalizedSearchTerm)) {
        prefixMatches.push(name);
      } else if (normalizedName.includes(normalizedSearchTerm)) {
        substringMatches.push(name);
      }
    }

    return [...prefixMatches, ...substringMatches].slice(0, maxResults);
  };

  const optionList = generateOptionList();

  const selectedUser = users.find(user => user.id === selectedUserId)();

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
        placeholder="Search users…"
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
