import React from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import Bugsnag from '@bugsnag/react-native';

import { database } from '../database';
import { QuestionScreen } from './QuestionScreen';
import { SubmitScreen } from './SubmitScreen';
import {
  Button,
  KeyboardSpacer,
  ProgressActionBar,
  Popup,
  StatusMessage,
  TupaiaBackground,
  STATUS_MESSAGE_ERROR,
} from '../widgets';
import { SurveyTableOfContents } from './SurveyTableOfContents';
import { DEFAULT_PADDING, THEME_COLOR_ONE, THEME_FONT_SIZE_ONE } from '../globalStyles';
import { HeaderLeftButton } from '../navigation/HeaderLeftButton';

const LENGTH_OF_TRANSITION = 300;

export class DumbSurveyScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: navigation.state.params.headerLabel,
    // eslint-disable-next-line global-require
    headerLeft: () => <HeaderLeftButton source={require('../images/x.png')} labelVisible={false} />,
  });

  constructor(props) {
    super(props);

    this.state = {
      isTableOfContentsVisible: false,
      screenIndexAnimation: new Animated.Value(props.screenIndex),
      lastScreenIndex: null,
    };
  }

  componentDidMount() {
    this.updateHeaderLabel(this.props.surveyName);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.screenIndex !== this.props.screenIndex) {
      this.setState({
        lastScreenIndex: this.props.screenIndex,
      });
      this.state.screenIndexAnimation.stopAnimation();
      this.state.screenIndexAnimation.setValue(this.props.screenIndex);
      Animated.timing(this.state.screenIndexAnimation, {
        toValue: nextProps.screenIndex,
        duration: LENGTH_OF_TRANSITION,
        useNativeDriver: false,
      }).start(() => {
        this.setState({ lastScreenIndex: null });
      });
    }

    if (nextProps.surveyName !== this.props.surveyName) {
      this.updateHeaderLabel(nextProps.surveyName);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.screenIndex !== nextProps.screenIndex) return true;
    if (this.props.isSubmitting !== nextProps.isSubmitting) return true;
    if (this.props.errorMessage !== nextProps.errorMessage) return true;
    if (this.state !== nextState) return true;
    return false;
  }

  /**
   * Error boundary
   */
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  /**
   * Error boundary logger
   */
  componentDidCatch(error, info) {
    error.message = `Survey boundary error: ${error.message}`;
    Bugsnag.notify(error);
  }

  onToggleToc() {
    this.setState({ isTableOfContentsVisible: !this.state.isTableOfContentsVisible });
  }

  onSelectScreen(screenIndex) {
    const { onSelectSurveyScreen } = this.props;

    onSelectSurveyScreen(screenIndex);
    this.setState({ isTableOfContentsVisible: false });
  }

  updateHeaderLabel(headerLabel) {
    this.props.navigation.setParams({ headerLabel });
  }

  getStyleForContent(forScreenIndex) {
    const { screenIndex: currentScreenIndex } = this.props;
    const { lastScreenIndex } = this.state;
    const isCurrentScreen = forScreenIndex === currentScreenIndex;
    const isIncreasing = currentScreenIndex > lastScreenIndex;

    // Interpolations must be based on increasing input range
    const halfWay = currentScreenIndex - (currentScreenIndex - lastScreenIndex) / 2;
    const inputRange = isIncreasing
      ? [lastScreenIndex, halfWay, currentScreenIndex]
      : [currentScreenIndex, halfWay, lastScreenIndex];

    // Output range depends on if this is the screen fading in or fading out, and in which direction
    // the input range was ordered
    let outputRange;
    if (isCurrentScreen) {
      outputRange = isIncreasing ? [0, 0, 1] : [1, 0, 0];
    } else {
      outputRange = isIncreasing ? [1, 0, 0] : [0, 0, 1];
    }

    const isTransitioningIn = isCurrentScreen && this.state.lastScreenIndex !== null;
    return {
      opacity: this.state.screenIndexAnimation.interpolate({ inputRange, outputRange }),
      position: isTransitioningIn ? 'absolute' : 'relative',
      left: 0,
      right: 0,
      flex: 1,
    };
  }

  render() {
    const {
      errorMessage,
      onPressPrevious,
      onPressNext,
      onPressRepeat,
      onPressSubmit,
      surveyName,
      surveyProgress,
      isSubmitting,
      surveyScreens,
      screenIndex,
      questions,
    } = this.props;
    const { hasError } = this.state;
    if (hasError) {
      return (
        <Text style={localStyles.hasErrorText}>
          The survey has entered an invalid state. Please contact your survey administrator.
        </Text>
      );
    }

    const { isTableOfContentsVisible } = this.state;

    return (
      <TupaiaBackground style={localStyles.container}>
        {[0, 1].map(index => {
          // Even screens will use the first component, odd will use the second
          const isCurrentContent = screenIndex % 2 === index;
          const screenIndexForThisContent = isCurrentContent
            ? screenIndex
            : this.state.lastScreenIndex;
          if (screenIndexForThisContent === null) {
            return null;
          }

          return (
            <Animated.View
              key={screenIndexForThisContent}
              style={this.getStyleForContent(screenIndexForThisContent)}
            >
              {isCurrentContent && !!errorMessage && (
                <StatusMessage type={STATUS_MESSAGE_ERROR} message={errorMessage} />
              )}
              {screenIndexForThisContent === surveyScreens.length ? (
                <SubmitScreen />
              ) : (
                <QuestionScreen database={database} screenIndex={screenIndexForThisContent} />
              )}
              {isSubmitting && <ActivityIndicator color={THEME_COLOR_ONE} size="large" />}
              {(onPressSubmit || onPressRepeat) && (
                <View style={localStyles.buttonContainerContainer}>
                  {isCurrentContent && onPressSubmit !== null && !isSubmitting && (
                    <Button
                      title="Submit"
                      onPress={onPressSubmit}
                      style={localStyles.submitButton}
                    />
                  )}
                  {isCurrentContent && onPressRepeat !== null && !isSubmitting && (
                    <Button
                      title="Submit and repeat"
                      onPress={onPressRepeat}
                      style={localStyles.submitButton}
                    />
                  )}
                </View>
              )}
            </Animated.View>
          );
        })}
        <ProgressActionBar
          progress={surveyProgress}
          label="Jump to section"
          style={localStyles.actionBar}
          onPressNext={onPressNext}
          onPressPrevious={onPressPrevious}
          isPreviousEnabled={onPressPrevious !== null && !isSubmitting}
          isNextEnabled={onPressNext !== null && !isSubmitting}
          isTableOfContentsEnabled={!isSubmitting}
          onPressToc={() => this.onToggleToc()}
        />

        <Popup
          visible={isTableOfContentsVisible}
          onDismiss={() => this.onToggleToc()}
          title={surveyName}
        >
          <SurveyTableOfContents
            screens={surveyScreens}
            questions={questions}
            onSelectScreen={selectedScreenIndex => this.onSelectScreen(selectedScreenIndex)}
            activeScreenIndex={screenIndex}
          />
        </Popup>
        <KeyboardSpacer />
      </TupaiaBackground>
    );
  }
}

DumbSurveyScreen.propTypes = {
  onPressPrevious: PropTypes.func,
  onPressNext: PropTypes.func,
  onPressSubmit: PropTypes.func,
  onPressRepeat: PropTypes.func,
  onSelectSurveyScreen: PropTypes.func,
  surveyName: PropTypes.string.isRequired,
  surveyProgress: PropTypes.number.isRequired,
  isSubmitting: PropTypes.bool,
  surveyScreens: PropTypes.array.isRequired,
  screenIndex: PropTypes.number.isRequired,
};

DumbSurveyScreen.defaultProps = {
  onPressPrevious: null,
  onPressNext: null,
  onPressSubmit: null,
  onPressRepeat: null,
  isSubmitting: false,
  onSelectSurveyScreen: null,
};

const ACTION_BAR_HEIGHT = 80;

const localStyles = StyleSheet.create({
  buttonContainerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 40,
  },
  submitButton: {
    margin: 5,
  },
  actionBar: {
    position: 'relative',
    height: ACTION_BAR_HEIGHT,
  },
  hasErrorText: {
    fontSize: THEME_FONT_SIZE_ONE,
    textAlign: 'center',
    padding: DEFAULT_PADDING,
  },
});
