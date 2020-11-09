/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Alert, StyleSheet, View, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { connect } from 'react-redux';

import { Text, TouchableOpacity } from '../../widgets';
import {
  DEFAULT_PADDING,
  getThemeColorOneFaded,
  THEME_FONT_FAMILY,
  THEME_TEXT_COLOR_ONE,
  THEME_FONT_SIZE_ONE,
  THEME_COLOR_ONE,
} from '../../globalStyles';
import { watchUserLocation, refreshWatchingUserLocation } from '../../utilities/userLocation';

const RECOMMENDED_ACCURACY = 20;
const MINIMUM_ACCURACY_LEVEL = 100;

const getMaterialIcon = (iconName, style = {}) => (
  <Icon
    name={iconName}
    size={14}
    pointerEvents="none"
    color={THEME_COLOR_ONE}
    style={[localStyles.icon, style]}
  />
);

class GeolocateQuestionComponent extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isFindingLocation: false,
      errorMessage: '',
    };
  }

  componentDidMount() {
    // Watch location from the beginning to get the most accurate location if a user
    // decides to find and lock a location.
    const { onWatchUserLocation } = this.props;
    onWatchUserLocation();
  }

  componentDidUpdate() {
    const { isFindingLocation } = this.state;
    const { userLocation } = this.props;

    if (isFindingLocation) {
      this.updateAnswer();

      if (
        userLocation.errorMessage &&
        this.props.answer.errorMessage !== userLocation.errorMessage
      ) {
        this.onGeolocationError(userLocation.errorMessage);
      }
    }
  }

  componentWillUnmount() {
    this.lockLocation();
  }

  onPressFindLocation() {
    this.setState({
      isFindingLocation: true,
      errorMessage: '',
    });
    this.props.onRefresh();
    this.props.onChangeAnswer({});
  }

  onGeolocationError(errorMessage) {
    this.setState({
      isFindingLocation: false,
      errorMessage,
    });
  }

  onRemoveLocation() {
    Alert.alert(
      'Remove tagged location',
      'Are you sure you want to remove the currently selected location for this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => this.removeLocation() },
      ],
      { cancelable: true },
    );
  }

  onLockLocation() {
    const { answer } = this.props;
    const { accuracy } = answer;

    if (accuracy <= RECOMMENDED_ACCURACY) {
      this.lockLocation();
    } else {
      Alert.alert(
        'Accuracy is low',
        `The recommended accuracy for GPS tags is <${RECOMMENDED_ACCURACY}m and the current accuracy is ${accuracy}m.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save location', onPress: () => this.lockLocation() },
        ],
        { cancelable: true },
      );
    }
  }

  getLocationLabel() {
    const { answer } = this.props;
    const { isFindingLocation } = this.state;
    const { latitude, longitude, accuracy } = answer;

    if (!latitude || (accuracy > MINIMUM_ACCURACY_LEVEL && isFindingLocation)) {
      return 'Finding location...';
    }

    return `${latitude.toString().substr(0, 9)}, ${longitude
      .toString()
      .substr(0, 9)} (${accuracy}m accuracy)`;
  }

  updateAnswer() {
    const { onChangeAnswer, userLocation, answer } = this.props;
    const { latitude, longitude, accuracy, errorMessage } = userLocation;

    const locationHasChanged =
      latitude !== answer.latitude ||
      longitude !== answer.longitude ||
      accuracy !== answer.accuracy;

    if ((latitude !== null || errorMessage) && locationHasChanged) {
      onChangeAnswer({
        latitude,
        longitude,
        accuracy,
        errorMessage,
      });
    }
  }

  hasAnswer() {
    const { answer } = this.props;
    return !!(answer && answer.latitude);
  }

  lockLocation() {
    this.setState({
      isFindingLocation: false,
      errorMessage: '',
    });
  }

  removeLocation() {
    const { onChangeAnswer } = this.props;

    this.lockLocation();
    onChangeAnswer({});
  }

  renderSaveLocationButton() {
    return (
      <TouchableOpacity
        analyticsLabel="Geolocate: Save"
        onPress={() => this.onLockLocation()}
        style={localStyles.actionButton}
      >
        {getMaterialIcon('check')}
        <Text>Save location</Text>
      </TouchableOpacity>
    );
  }

  renderRefreshButton() {
    return (
      <TouchableOpacity
        analyticsLabel="Geolocate: Retry"
        onPress={() => this.onPressFindLocation()}
        style={localStyles.actionButton}
      >
        {getMaterialIcon('refresh')}
        <Text>Retry</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { isFindingLocation, errorMessage } = this.state;
    const hasAnswer = this.hasAnswer();

    let label = '';
    let icon = null;
    let actionButton = null;

    if (isFindingLocation) {
      label = this.getLocationLabel();
      icon = <ActivityIndicator color={THEME_COLOR_ONE} style={localStyles.icon} />;
      actionButton = this.renderSaveLocationButton();
    } else if (errorMessage) {
      label = errorMessage;
      icon = getMaterialIcon('location-disabled');
      actionButton = this.renderRefreshButton();
    } else if (hasAnswer) {
      label = this.getLocationLabel();
      icon = getMaterialIcon('gps-fixed');
    } else {
      label = 'Tap to detect current location';
      icon = getMaterialIcon('gps-not-fixed');
    }

    return (
      <View>
        <View style={localStyles.wrapper}>
          <TouchableOpacity
            analyticsLabel={`Geolocate: ${label}`}
            style={localStyles.field}
            onPress={() => this.onPressFindLocation()}
            disabled={hasAnswer || isFindingLocation}
          >
            {icon}
            <Text style={localStyles.textInput}>{label}</Text>
          </TouchableOpacity>
          {hasAnswer && !errorMessage && (
            <TouchableOpacity
              analyticsLabel="Geolocate: Clear"
              style={localStyles.removeButton}
              onPress={() => this.onRemoveLocation()}
            >
              {getMaterialIcon('close')}
            </TouchableOpacity>
          )}
        </View>
        {actionButton}
      </View>
    );
  }
}

GeolocateQuestionComponent.propTypes = {
  answer: PropTypes.object,
  onChangeAnswer: PropTypes.func.isRequired,
  userLocation: PropTypes.object.isRequired,
  onWatchUserLocation: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

GeolocateQuestionComponent.defaultProps = {
  answer: {},
};

const mapStateToProps = ({ userLocation }) => ({
  userLocation,
});

const mapDispatchToProps = dispatch => ({
  onWatchUserLocation: () => dispatch(watchUserLocation()),
  onRefresh: () => dispatch(refreshWatchingUserLocation()),
});

export const GeolocateQuestion = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GeolocateQuestionComponent);

const localStyles = StyleSheet.create({
  locationInfo: {
    marginTop: DEFAULT_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: getThemeColorOneFaded(0.5),
  },
  button: {
    marginTop: DEFAULT_PADDING,
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: getThemeColorOneFaded(0.2),
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    color: THEME_TEXT_COLOR_ONE,
    fontFamily: THEME_FONT_FAMILY,
    fontSize: THEME_FONT_SIZE_ONE,
    paddingVertical: 10,
    height: 40,
  },
  icon: {
    marginRight: 5,
  },
  removeButton: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
