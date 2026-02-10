import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, Text, FlatList, View } from 'react-native';

import { THEME_TEXT_COLOR_FOUR, DEFAULT_PADDING, getGreyShade } from '../globalStyles';
import { FeedItemContainer } from '../social';
import { HomeHeaderContainer } from './HomeHeaderContainer';
import { TupaiaLogo } from '../widgets';
import { HomeToolbarContainer } from './HomeToolbarContainer';

class HomeScreenComponent extends PureComponent {
  static navigationOptions = {
    headerTitle: () => <TupaiaLogo />,
    headerTitleAlign: 'left',
  };

  constructor(props) {
    super(props);

    this.state = {
      isFloatingHeaderVisible: false,
      headerHeight: 0,
      isScreenFocused: false,
    };

    this.floatingHeaderVisibleAnimation = new Animated.Value(0);
  }

  componentDidMount() {
    this.props.onFetchFeedLatest();
  }

  UNSAFE_componentWillReceiveProps() {
    const { isScreenFocused } = this.state;
    const isNavigationFocused = this.props.navigation.isFocused();
    if (isScreenFocused !== isNavigationFocused) {
      this.setState({ isScreenFocused: isNavigationFocused });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isFloatingHeaderVisible, isScreenFocused } = this.state;

    if (prevState.isFloatingHeaderVisible !== isFloatingHeaderVisible) {
      Animated.timing(this.floatingHeaderVisibleAnimation, {
        toValue: isFloatingHeaderVisible ? 1 : 0,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }

    if (isScreenFocused && prevState.isScreenFocused !== isScreenFocused) {
      this.props.onFetchFeedLatest();
    }
  }

  onEndReached = () => {
    const { hasErrorMessage } = this.props;

    // Do not load new pages until the error is
    // resolved by successfuly refreshing the feed.
    if (!hasErrorMessage) {
      this.props.onLoadNextFeedPage();
    }
  };

  onScroll = event => {
    const { headerHeight, isFloatingHeaderVisible } = this.state;
    const scrollTop = event.nativeEvent.contentOffset.y;
    const shouldFloatingHeaderBeVisible = scrollTop > headerHeight;

    if (isFloatingHeaderVisible !== shouldFloatingHeaderBeVisible) {
      this.setState({ isFloatingHeaderVisible: shouldFloatingHeaderBeVisible });
    }
  };

  onHeaderLayout = event => {
    this.setState({
      // 100 is a magic number which corresponds to the top of the
      // survey facility button.
      headerHeight: event.nativeEvent.layout.height - 100,
    });
  };

  renderFeedItem = ({ item }) => {
    return <FeedItemContainer {...item} />;
  };

  renderListEmptyMessage = () => {
    const { isFeedLoading } = this.props;
    if (isFeedLoading) {
      return null;
    }

    return (
      <Text style={localStyles.connectivityMessage}>
        Please connect to the internet to receive recent activity.
      </Text>
    );
  };

  renderFloatingHeader() {
    return (
      <Animated.View
        style={[
          localStyles.floatingBanner,
          {
            opacity: this.floatingHeaderVisibleAnimation,
            transform: [
              {
                translateY: this.floatingHeaderVisibleAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-150, 0],
                }),
              },
            ],
          },
        ]}
      >
        <HomeToolbarContainer />
      </Animated.View>
    );
  }

  render() {
    const { feedItems } = this.props;

    return (
      <View style={localStyles.container}>
        <FlatList
          ref={listElement => {
            this.listElement = listElement;
          }}
          style={localStyles.container}
          ListHeaderComponent={<HomeHeaderContainer onLayout={this.onHeaderLayout} />}
          ListEmptyComponent={this.renderListEmptyMessage}
          keyExtractor={(item, index) => `${index}`}
          scrollEventThrottle={50}
          onScroll={this.onScroll}
          data={feedItems}
          renderItem={this.renderFeedItem}
          onEndReached={this.onEndReached}
        />
        {this.renderFloatingHeader()}
      </View>
    );
  }
}

export const HomeScreen = HomeScreenComponent;

HomeScreen.propTypes = {
  feedItems: PropTypes.array.isRequired,
  onFetchFeedLatest: PropTypes.func.isRequired,
  isFeedLoading: PropTypes.bool.isRequired,
  hasErrorMessage: PropTypes.bool.isRequired,
  onLoadNextFeedPage: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getGreyShade(0.03),
  },
  connectivityMessage: {
    padding: DEFAULT_PADDING,
    color: THEME_TEXT_COLOR_FOUR,
  },
  floatingBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: getGreyShade(0.03),
    alignItems: 'center',
    padding: DEFAULT_PADDING,
    borderBottomWidth: 1,
    borderColor: getGreyShade(0.1),
  },
});
