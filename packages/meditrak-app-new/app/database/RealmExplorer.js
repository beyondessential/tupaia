/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';

import { database } from './singleton';
import * as dataTypes from './types';
import { TupaiaBackground } from '../widgets';

const DATA_TYPES = Object.keys(dataTypes);

/**
 * A page to explore the contents of the local database. Allows searching for any
 * database object type, and will show the related data in a table.
 * @prop   {Realm}               database      App wide database.
 * @state  {ListView.DataSource} dataSource    DataTable input, used to update rows being rendered.
 * @state  {Realm.Results}       data          Holds the data that get put into the dataSource
 */
export class RealmExplorer extends React.Component {
  static navigationOptions = {
    headerTitle: 'Realm Explorer',
  };

  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      data: [],
      selectedType: DATA_TYPES[0],
    };
  }

  componentDidMount() {
    this.setDataTypeDisplayed(DATA_TYPES[0]);
  }

  onSearchChange = searchTerm => {
    if (DATA_TYPES.indexOf(searchTerm) < 0) return;
    this.setDataTypeDisplayed(searchTerm);
  };

  setDataTypeDisplayed = type => {
    const databaseType = type === 'GeographicalArea' ? 'Area' : type;
    const rawData = database.objects(databaseType);
    const data = rawData.map(row => {
      const rowData = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (
          value !== undefined &&
          value !== null &&
          (typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value.getMonth === 'function')
        )
          rowData[key] = String(value);
        else if (typeof value === 'boolean') rowData[key] = value ? 'True' : 'False';
        else if (value && value.length) rowData[key] = value.length;
        // Most likely a realm list
        else if (value && value.id) rowData[key] = value.id;
        // Most likely a realm object
        else rowData[key] = '?';
      });
      return rowData;
    });
    const columns = generateColumns(rawData);
    this.setState({
      selectedType: type,
      columns,
      data,
    });
  };

  render() {
    return (
      <MenuContext style={localStyles.container}>
        <TupaiaBackground style={localStyles.container}>
          <View style={localStyles.menuWrapper}>
            <Menu
              style={localStyles.menu}
              onSelect={value => {
                this.setDataTypeDisplayed(value);
              }}
            >
              <MenuTrigger>
                <Text style={localStyles.menuButton}>{this.state.selectedType}</Text>
              </MenuTrigger>
              <MenuOptions optionsContainerStyle={localStyles.options}>
                {DATA_TYPES.map(typeName => (
                  <MenuOption value={typeName} key={typeName}>
                    <Text>{typeName}</Text>
                  </MenuOption>
                ))}
              </MenuOptions>
            </Menu>
          </View>
          <View style={localStyles.rowContainer}>
            {this.state.columns.map(({ key, title }) => (
              <Text key={key} style={localStyles.cell}>
                {title}
              </Text>
            ))}
          </View>
          <FlatList
            data={this.state.data}
            renderItem={({ item }) => (
              <View style={localStyles.rowContainer}>
                {this.state.columns.map(({ key }) => (
                  <Text key={key} style={localStyles.cell}>
                    {item[key]}
                  </Text>
                ))}
              </View>
            )}
            keyExtractor={JSON.stringify}
          />
        </TupaiaBackground>
      </MenuContext>
    );
  }
}

function generateColumns(rawData) {
  if (rawData && rawData.length > 0) {
    const firstObject = rawData[0];
    return Object.keys(firstObject).map(key => ({
      key,
      title: key,
    }));
  }
  return [];
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    color: 'white',
  },
  options: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  menu: {
    padding: 20,
  },
  menuButton: {
    fontSize: 20,
    color: 'white',
  },
  menuWrapper: {
    position: 'relative',
  },
});
