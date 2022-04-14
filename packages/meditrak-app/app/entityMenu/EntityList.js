/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';

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
export class EntityList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      searchResults: null,
      isOpen: false,
    };
  }

  componentDidMount() {
    const { onMount, startOpen } = this.props;
    if (onMount) {
      onMount(); // E.g. pull database records into the redux store to populate the clinic list
    }

    if (startOpen) {
      this.openResults();
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
    this.props.releaseScrollControl();
  }

  openResults = () => {
    // if opening results, take scroll control from outer scroll view
    this.setState(
      {
        isOpen: true,
      },
      () => {
        this.props.takeScrollControl();
        this.props.scrollIntoFocus();
      },
    );
  };

  selectRow = row => {
    // once a row is selected, release scroll control to the outer scroll view
    this.props.releaseScrollControl();
    this.setState({
      searchTerm: '',
      searchResults: null,
      isOpen: false,
    });
    this.props.onRowPress(row);
  };

  deselectRow = () => {
    this.props.onClear();
    // if we started with the results open, open them back up after clearing the entity
    if (this.props.startOpen) {
      this.openResults();
    }
  };

  handleSearchChange = searchTerm => {
    if (!searchTerm) {
      this.setState({
        searchTerm: '',
        searchResults: null,
      });
      return;
    }

    const { entities } = this.props;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const searchResults = entities
      .filter(
        ({ name, parentName }) =>
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
      searchTerm,
      searchResults,
    });
  };

  renderEntityCell = ({ item, onDeselect }) => {
    const { selectedEntityId } = this.props;
    const isSelected = item.id === selectedEntityId;
    return (
      <EntityItem
        entity={item}
        onPress={this.selectRow}
        isSelected={isSelected}
        onDeselect={onDeselect}
      />
    );
  };

  renderResults() {
    const { entities } = this.props;
    const { searchTerm, searchResults, isOpen } = this.state;

    // while entities is null, we're still loading from the database
    if (!entities) {
      return <Text style={localStyles.noResultsText}>Loading...</Text>;
    }

    // if entities is not null, but empty, the survey is probably misconfigured
    if (entities.length === 0) {
      return (
        <Text style={localStyles.noResultsText}>
          No valid entities for this question, please contact your survey administrator.
        </Text>
      );
    }

    // if searchResults is not null, but empty, there are no entities matching their search
    if (searchResults && searchResults.length === 0) {
      return (
        <Text style={localStyles.noResultsText}>{`No entities matching '${searchTerm}'.`}</Text>
      );
    }

    if (isOpen) {
      return (
        <FlatList
          data={searchResults || entities}
          renderItem={this.renderEntityCell}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="always"
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={2}
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
          style={localStyles.resultsContainer}
        />
      );
    }

    return null;
  }

  render() {
    const { entities, selectedEntityId } = this.props;
    const { searchTerm } = this.state;

    if (entities && selectedEntityId) {
      const selectedEntity = entities.find(i => i.id === selectedEntityId);
      return (
        <View style={localStyles.container}>
          {this.renderEntityCell({ item: selectedEntity, onDeselect: this.deselectRow })}
        </View>
      );
    }

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
            onFocus={this.openResults}
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
        {this.renderResults()}
      </View>
    );
  }
}

EntityList.propTypes = {
  entities: PropTypes.array,
  selectedEntityId: PropTypes.string,
  onRowPress: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onMount: PropTypes.func,
  startOpen: PropTypes.bool.isRequired,
  takeScrollControl: PropTypes.func.isRequired,
  releaseScrollControl: PropTypes.func.isRequired,
  scrollIntoFocus: PropTypes.func.isRequired,
};

EntityList.defaultProps = {
  entities: null,
  selectedEntityId: '',
  onMount: null,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultsContainer: {
    height: Dimensions.get('window').height, // fixed height so FlatList optimisations work within the outer ScrollView
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
