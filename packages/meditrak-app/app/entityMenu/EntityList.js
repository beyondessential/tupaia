/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Icon, TextInput, TouchableOpacity } from '../widgets';
import {
  DEFAULT_PADDING,
  THEME_COLOR_ONE,
  THEME_TEXT_COLOR_ONE,
  THEME_FONT_SIZE_ONE,
  getThemeColorOneFaded,
  getGreyShade,
} from '../globalStyles';
import { EntityItem, ITEM_HEIGHT } from './EntityItem';

const SEARCH_BOX_HEIGHT = 40;
const DEBOUNCE_TIME = 500;
const MAX_RESULTS = 100;

export class EntityList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      searchResults: null,
    };
    this.debounceTimeout = null;
  }

  componentDidMount() {
    const { onMount } = this.props;
    if (onMount) {
      onMount(); // E.g. pull database records into the redux store to populate the clinic list
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchTerm !== this.state.searchTerm && this.listComponent) {
      this.listComponent.scrollToIndex({
        index: 0,
        viewPosition: 0,
        animated: false,
      });
    }
  }

  componentWillUnmount() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }

  handleSearchChange = searchTerm => {
    this.setState({ searchTerm });

    if (!searchTerm) {
      this.setState({
        searchTerm: '',
        searchResults: null,
      });
    } else {
      this.setState({
        searchTerm,
      });
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = setTimeout(() => this.updateListData(searchTerm), DEBOUNCE_TIME);
    }
  };

  updateListData = searchTerm => {
    const { filteredEntities } = this.props;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const searchResults = filteredEntities
      .filter(
        ({ name, parent_name: parentName }) =>
          name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (parentName && parentName.toLowerCase().includes(lowerCaseSearchTerm)),
      )
      .sort(({ name: a }, { name: b }) => {
        // Send entity names that start with the search term to the top.
        const checkMatchesAtStart = name => name.toLowerCase().startsWith(lowerCaseSearchTerm);
        if (checkMatchesAtStart(a) !== checkMatchesAtStart(b)) {
          return checkMatchesAtStart(a) ? -1 : 1;
        }

        // Sort alphabetically
        return a.localeCompare(b);
      });
    this.setState({
      searchResults,
    });
  };

  renderEntityCell = ({ item }) => {
    const { onRowPress, selectedEntityId } = this.props;
    const isSelected = item.id === selectedEntityId;
    return <EntityItem entity={item} onPress={onRowPress} isSelected={isSelected} />;
  };

  render() {
    const { filteredEntities } = this.props;
    const { searchTerm, searchResults } = this.state;
    const listData = (searchResults || filteredEntities).slice(0, MAX_RESULTS);

    return (
      <View style={localStyles.container}>
        <View style={localStyles.searchBox}>
          <Icon
            name="search"
            style={localStyles.searchBoxIcon}
            library="Material"
            size={SEARCH_BOX_HEIGHT / 2}
            color={THEME_COLOR_ONE}
          />
          <TextInput
            style={localStyles.searchBoxInput}
            placeholder="Search"
            placeholderTextColor={getGreyShade(0.1)}
            value={searchTerm}
            onChangeText={this.handleSearchChange}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              analyticsLabel="Clinic List: Search box close"
              style={localStyles.searchBoxCloseButton}
              onPress={() => this.handleSearchChange('')}
            >
              <Icon name="close" library="Material" size={16} color={THEME_COLOR_ONE} />
            </TouchableOpacity>
          )}
        </View>
        {!listData || listData.length === 0 ? (
          <Text style={localStyles.noResultsText}>
            {listData.length === 0 ? `No entities matching '${searchTerm}'.` : 'Loading...'}
          </Text>
        ) : (
          <FlatList
            data={listData}
            renderItem={this.renderEntityCell}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="always"
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            windowSize={50}
            // This allows fast scrolling of the entire list, without getting the layout the
            // list (especially on slower devices) will stop scrolling before the end is reached
            // and the device will take a moment to increase the scroll height before continuing.
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            ref={listComponent => {
              this.listComponent = listComponent;
            }}
            style={localStyles.container}
          />
        )}
      </View>
    );
  }
}

EntityList.propTypes = {
  filteredEntities: PropTypes.array.isRequired,
  selectedEntityId: PropTypes.string,
  onRowPress: PropTypes.func.isRequired,
  onMount: PropTypes.func,
};

EntityList.defaultProps = {
  selectedEntityId: '',
  onMount: null,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBox: {
    borderColor: getThemeColorOneFaded(0.7),
    borderWidth: 1,
    flexDirection: 'row',
    position: 'relative',
    height: SEARCH_BOX_HEIGHT,
    backgroundColor: getThemeColorOneFaded(0.1),
    borderRadius: SEARCH_BOX_HEIGHT / 2,
    margin: DEFAULT_PADDING,
  },
  searchBoxInput: {
    flexGrow: 1,
    flex: 1,
    color: THEME_COLOR_ONE,
    fontSize: THEME_FONT_SIZE_ONE,
    height: SEARCH_BOX_HEIGHT,
    paddingLeft: 35,
  },
  searchBoxIcon: {
    position: 'absolute',
    top: 9,
    left: 10,
  },
  searchBoxCloseButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: SEARCH_BOX_HEIGHT,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entityCellText: {
    color: THEME_TEXT_COLOR_ONE,
    fontSize: THEME_FONT_SIZE_ONE,
  },
  entityCellSubText: {
    flex: 1,
    color: THEME_TEXT_COLOR_ONE,
    fontSize: 12,
    opacity: 0.8,
    // This marginBottom is to prevent the bottom of text being clipped off by the row paddingVertical on Android.
    marginBottom: -10,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: DEFAULT_PADDING,
    paddingVertical: 10,
    height: ITEM_HEIGHT,
  },
  selectedRow: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    paddingHorizontal: DEFAULT_PADDING,
    paddingVertical: 10,
    height: ITEM_HEIGHT,
  },
  rowContent: {
    flexGrow: 1,
  },
  rowIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  noResultsText: {
    fontSize: THEME_FONT_SIZE_ONE,
    textAlign: 'center',
    padding: DEFAULT_PADDING,
    color: THEME_COLOR_ONE,
  },
});
