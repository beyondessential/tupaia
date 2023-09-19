/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getFileInDocumentsPath, objectToArrayWithIds } from '../utilities';
import { MenuItem } from '../widgets';
import { initialiseSurveys, selectSurvey, selectSurveyGroup } from './actions';
import { DEFAULT_PADDING, getGreyShade, THEME_COLOR_DARK } from '../globalStyles';

const MENU_ITEM_WIDTH = (Dimensions.get('window').width - 50) / 2;

class DumbSurveysMenu extends React.Component {
  componentDidMount() {
    this.props.onMount();
  }

  shouldComponentUpdate(nextProps) {
    // If the array of menu items has differences, rerender. Otherwise no need.
    if (
      this.props.menuItems.length !== nextProps.menuItems.length ||
      this.props.menuItems.some((menuItem, index) => menuItem.id !== nextProps.menuItems[index].id)
    ) {
      return true;
    }
    return false;
  }

  render() {
    const { menuItems } = this.props;
    const items = menuItems.map(({ id, name, imageName, onSelect }) => (
      <MenuItem
        key={id}
        text={name}
        style={localStyles.menuItem}
        imageSource={imageName ? { uri: getFileInDocumentsPath(imageName) } : null}
        onPress={onSelect}
        width={MENU_ITEM_WIDTH}
        height={MENU_ITEM_WIDTH}
      />
    ));

    return (
      <ScrollView style={localStyles.list} contentContainerStyle={localStyles.listContent}>
        <View style={localStyles.container}>{items}</View>
      </ScrollView>
    );
  }
}

DumbSurveysMenu.propTypes = {
  onMount: PropTypes.func.isRequired,
  menuItems: PropTypes.array.isRequired,
};

const localStyles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: DEFAULT_PADDING,
    backgroundColor: getGreyShade(0.03),
    borderBottomWidth: 1,
    borderBottomColor: getGreyShade(0.1),
  },
  headerContent: {
    flex: 1,
    paddingLeft: DEFAULT_PADDING,
  },
  headingTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headingText: {
    color: THEME_COLOR_DARK,
  },
  headingMoreIcon: {
    marginRight: 0,
    marginLeft: 'auto',
    alignSelf: 'center',
  },
  logo: {
    margin: 0,
    alignSelf: 'flex-start',
  },
  container: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: DEFAULT_PADDING,
  },
  menuItem: {
    flex: 0,
    width: MENU_ITEM_WIDTH,
    height: MENU_ITEM_WIDTH,
    marginVertical: 10,
  },
});

function mapStateToProps(state) {
  const { assessment: assessmentState } = state;
  const { surveys } = assessmentState;
  const { selectedCountryName } = state.country;

  return {
    surveys: surveys ? objectToArrayWithIds(surveys) : [],
    selectedCountryName,
  };
}

function mergeProps(stateProps, { dispatch }, ownProps) {
  const { surveys, ...restOfState } = stateProps;
  const { expandedSurveyGroupId } = ownProps;
  const menuItems = [];
  surveys.forEach(survey => {
    // Some surveys are part of groups, in which case in redux they will look like
    // { id: 'surveyId', name: 'surveyName', ..., group: { id: 'groupId', name: 'groupName' }}
    const surveyGroup = survey.group; // Extract the group this survey is in, if any

    // If a survey group has been drilled into, filter out surveys not in the selected survey group
    if (expandedSurveyGroupId && (!surveyGroup || surveyGroup.id !== expandedSurveyGroupId)) return;

    // If this survey is part of a (non-expanded) group, add a survey group to the menu
    if (surveyGroup && surveyGroup.id !== expandedSurveyGroupId) {
      // If this is the first survey we've seen in this group, add the group to the menu
      if (!menuItems.some(({ id }) => id === surveyGroup.id)) {
        menuItems.push({
          ...surveyGroup,
          imageName: survey.imageName, // Take the image from the first survey as the group image
          onSelect: () => dispatch(selectSurveyGroup(surveyGroup.id, surveyGroup.name)),
        });
      }
    } else {
      // This survey has nothing to do with a group, just add it to the menu as a normal survey
      menuItems.push({
        ...survey,
        onSelect: () => dispatch(selectSurvey(survey.id)),
      });
    }
  });
  return {
    ...ownProps,
    ...restOfState,
    menuItems,
    onMount: () => dispatch(initialiseSurveys()),
  };
}

export const SurveysMenu = connect(mapStateToProps, null, mergeProps)(DumbSurveysMenu);
