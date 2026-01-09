import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dimensions, SectionList, StyleSheet, Text, View } from 'react-native';

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
const INITIAL_NUMBER_TO_SHOW = 1000; // will load more if they scroll to the bottom of the list
const LOADING_MESSAGE_SECTION = { title: 'Loading more results...', data: [] }; // slightly hacky way of showing a loading message at the bottom of the list until more lazily load
const NO_RESULTS_SECTION = { title: 'No results', data: [] };

export class EntityList extends PureComponent {
  constructor(props) {
    super(props);
    this.validEntities = this.props.validEntities;
    this.state = {
      searchTerm: '',
      primarySearchResults: null,
      secondarySearchResults: null,
      isOpen: false,
      numberToShow: INITIAL_NUMBER_TO_SHOW,
    };
  }

  componentDidMount() {
    const { startOpen } = this.props;

    if (startOpen) {
      this.openResults();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchTerm !== this.state.searchTerm && this.listComponent) {
      this.listComponent.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
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
      primarySearchResults: null,
      secondarySearchResults: null,
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
        primarySearchResults: null,
        secondarySearchResults: null,
      });
      return;
    }

    // Use toLowerCase to ignore search casing
    const lowerSearch = searchTerm.toLowerCase();
    const primarySearchResults = this.validEntities.filter(entity =>
      entity.name.toLowerCase().startsWith(lowerSearch),
    );
    const secondarySearchResults = this.validEntities.filter(
      entity =>
        !entity.name.toLowerCase().startsWith(lowerSearch) &&
        (entity.name.toLowerCase().includes(lowerSearch) ||
          entity.parent?.name.toLowerCase().startsWith(lowerSearch)),
    );
    this.setState({
      searchTerm,
      primarySearchResults,
      secondarySearchResults,
    });
  };

  getListData = () => {
    const { primarySearchResults, secondarySearchResults, numberToShow } = this.state;

    if (primarySearchResults || secondarySearchResults) {
      const totalResultsAvailable = primarySearchResults.length + secondarySearchResults.length;
      if (totalResultsAvailable === 0) {
        return { noResults: true };
      }
      const data = [
        ...primarySearchResults.slice(0, numberToShow),
        ...secondarySearchResults.slice(0, Math.max(0, numberToShow - primarySearchResults.length)),
      ];
      const moreAvailable = data.length < totalResultsAvailable;
      return { sections: [{ data }], moreAvailable };
    }

    const { recentEntities } = this.props;
    const allEntities = this.validEntities.slice(0, numberToShow);
    const moreAvailable = allEntities.length < this.validEntities.length;
    if (recentEntities?.length > 0) {
      return {
        sections: [
          { title: 'Recently used', data: recentEntities },
          { title: 'All entities', data: allEntities },
        ],
        moreAvailable,
      };
    }
    return { sections: [{ data: allEntities }], moreAvailable };
  };

  getListSections = () => {
    const { sections, moreAvailable, noResults } = this.getListData();
    if (noResults) {
      return [NO_RESULTS_SECTION];
    }
    if (moreAvailable) {
      return [...sections, LOADING_MESSAGE_SECTION]; // slightly hacky way to show loading message
    }
    return sections;
  };

  renderEntityCell = ({ item, onDeselect }) => {
    const { selectedEntityId, config } = this.props;
    const isSelected = item.id === selectedEntityId;
    return (
      <EntityItem
        entity={item}
        hideParentName={config?.entity?.hideParentName}
        onPress={this.selectRow}
        isSelected={isSelected}
        onDeselect={onDeselect}
      />
    );
  };

  renderSectionHeader = ({ section }) => {
    if (!section.title) {
      return null;
    }
    return <Text style={localStyles.sectionHeaderText}>{section.title}</Text>;
  };

  renderResults() {
    const { isOpen, numberToShow } = this.state;

    // if validEntities fetch returned empty, the survey is probably misconfigured
    if (this.validEntities.length === 0) {
      return (
        <Text style={localStyles.noResultsText}>
          No valid entities for this question, please contact your survey administrator.
        </Text>
      );
    }

    if (isOpen) {
      return (
        <SectionList
          sections={this.getListSections()}
          renderItem={this.renderEntityCell}
          renderSectionHeader={this.renderSectionHeader}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="always"
          onEndReached={() => {
            this.setState({
              numberToShow: numberToShow + INITIAL_NUMBER_TO_SHOW,
            });
          }}
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
    const { selectedEntityId } = this.props;
    const { searchTerm } = this.state;

    if (this.validEntities.length > 0 && selectedEntityId) {
      const selectedEntity = this.validEntities.find(entity => entity.id === selectedEntityId);
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
  validEntities: PropTypes.array.isRequired,
  recentEntities: PropTypes.array.isRequired,
  selectedEntityId: PropTypes.string,
  onRowPress: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  startOpen: PropTypes.bool.isRequired,
  takeScrollControl: PropTypes.func.isRequired,
  releaseScrollControl: PropTypes.func.isRequired,
  scrollIntoFocus: PropTypes.func.isRequired,
  config: PropTypes.object,
};

EntityList.defaultProps = {
  selectedEntityId: '',
  config: null,
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
  sectionHeaderText: {
    color: THEME_TEXT_COLOR_ONE,
    fontSize: THEME_FONT_SIZE_ONE * 0.8,
    opacity: 0.8,
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
