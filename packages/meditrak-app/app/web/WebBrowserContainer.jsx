/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ActivityIndicator, View, Platform, Linking, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import urlParser from 'url';

import { setCanGoBack, setCanGoForward, setCurrentUrl, setIsLoading } from './actions';
import { Icon, TouchableOpacity, StatusMessage, STATUS_MESSAGE_ERROR } from '../widgets';
import {
  THEME_COLOR_ONE,
  THEME_COLOR_LIGHT,
  DEFAULT_PADDING,
  THEME_COLOR_FOUR,
  THEME_COLOR_DARK,
} from '../globalStyles';

class WebBrowser extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: navigation.state.params ? navigation.state.params.title : '',
  });

  onNavigationStateChange = navState => {
    const { onSetCanGoBack, onSetCanGoForward, onSetCurrentUrl, onSetIsLoading } = this.props;
    const { canGoBack, canGoForward, url, loading } = navState;
    const { baseUrl, navigation } = this.props;

    // Prevent links from hosts other than the original base
    // for this webview from opening in the internal webview.
    const parsedBaseUrl = urlParser.parse(baseUrl);
    const parsedUrl = urlParser.parse(url);
    if (parsedBaseUrl.host !== parsedUrl.host) {
      this.webView.stopLoading();
      this.webView.goBack();
      Linking.openURL(url);
      return;
    }

    navigation.setParams({ title: url });

    onSetCanGoBack(canGoBack);
    onSetCanGoForward(canGoForward);
    onSetCurrentUrl(url);
    onSetIsLoading(loading);
  };

  renderToolbar() {
    const { currentUrl, isLoading } = this.props;

    return (
      <View style={localStyles.toolbar}>
        <Text style={localStyles.toolbarUrl} numberOfLines={1}>
          {currentUrl}
        </Text>
        {isLoading ? <ActivityIndicator style={localStyles.toolbarLoader} /> : null}
      </View>
    );
  }

  renderNavbar() {
    const { canGoBack, canGoForward, isLoading, currentUrl } = this.props;
    return (
      <View style={localStyles.navbar}>
        <TouchableOpacity
          analyticsLabel="Web Browser: Back"
          disabled={!canGoBack}
          onPress={() => this.webView.goBack()}
          style={localStyles.navbarButton}
        >
          <Icon
            name="angle-left"
            color={canGoBack ? THEME_COLOR_DARK : THEME_COLOR_FOUR}
            size={18}
          />
        </TouchableOpacity>
        <TouchableOpacity
          analyticsLabel="Web Browser: Reload"
          disabled={isLoading}
          onPress={() => this.webView.reload()}
          style={localStyles.navbarButton}
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Icon name="refresh" color={THEME_COLOR_DARK} size={14} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          analyticsLabel="Web Browser: Browser"
          onPress={() => Linking.openURL(currentUrl)}
          style={localStyles.navbarButton}
        >
          <Icon
            name={Platform.OS === 'ios' ? 'safari' : 'chrome'}
            color={THEME_COLOR_DARK}
            size={14}
          />
        </TouchableOpacity>
        <TouchableOpacity
          analyticsLabel="Web Browser: Forward"
          disabled={!canGoForward}
          onPress={() => this.webView.goForward()}
          style={localStyles.navbarButton}
        >
          <Icon
            name="angle-right"
            color={canGoForward ? THEME_COLOR_DARK : THEME_COLOR_FOUR}
            size={18}
          />
        </TouchableOpacity>
      </View>
    );
  }

  renderError() {
    return (
      <StatusMessage
        type={STATUS_MESSAGE_ERROR}
        message={
          "Couldn't connect to website, please check your Internet connection and try again."
        }
      />
    );
  }

  render() {
    const { baseUrl } = this.props;

    return (
      <View style={localStyles.container}>
        <WebView
          source={{ uri: baseUrl }}
          style={localStyles.webView}
          onNavigationStateChange={this.onNavigationStateChange}
          automaticallyAdjustContentInsets={false}
          startInLoadingState
          ref={webView => {
            this.webView = webView;
          }}
          renderError={this.renderError}
        />
        {this.renderNavbar()}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLOR_ONE,
  },
  toolbar: {
    height: 50,
    flexDirection: 'row',
    position: 'relative',
    borderColor: THEME_COLOR_LIGHT,
    backgroundColor: '#eee',
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  navbar: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: THEME_COLOR_LIGHT,
    borderTopWidth: 1,
    borderTopColor: THEME_COLOR_FOUR,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DEFAULT_PADDING,
  },
  navbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  toolbarUrl: {},
  toolbarLoader: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  webView: {
    flex: 1,
  },
});

WebBrowser.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  currentUrl: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  canGoBack: PropTypes.bool.isRequired,
  canGoForward: PropTypes.bool.isRequired,
  onSetCanGoBack: PropTypes.func.isRequired,
  onSetCanGoForward: PropTypes.func.isRequired,
  onSetCurrentUrl: PropTypes.func.isRequired,
  onSetIsLoading: PropTypes.func.isRequired,
};

function mapStateToProps({ web }) {
  const { baseUrl, currentUrl, isLoading, canGoBack, canGoForward } = web;

  return {
    baseUrl,
    currentUrl,
    isLoading,
    canGoBack,
    canGoForward,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetCanGoBack: canGoBack => dispatch(setCanGoBack(canGoBack)),
    onSetCanGoForward: canGoForward => dispatch(setCanGoForward(canGoForward)),
    onSetCurrentUrl: currentUrl => dispatch(setCurrentUrl(currentUrl)),
    onSetIsLoading: isLoading => dispatch(setIsLoading(isLoading)),
  };
}

export const WebBrowserContainer = connect(mapStateToProps, mapDispatchToProps)(WebBrowser);
