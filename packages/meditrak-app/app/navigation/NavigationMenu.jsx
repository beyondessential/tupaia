/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import SideMenu from 'react-native-side-menu';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Text, Coconut, Pig, TouchableHighlight } from '../widgets';
import {
  THEME_COLOR_ONE,
  THEME_COLOR_TWO,
  THEME_COLOR_FOUR,
  THEME_COLOR_LIGHT,
  THEME_COLOR_SIX,
  THEME_COLOR_SIDEMENU_ICON,
  THEME_TEXT_COLOR_THREE,
  DEFAULT_PADDING,
  THEME_FONT_SIZE_TWO,
} from '../globalStyles';

const REWARD_ICON_SIZE = 25;

const renderMenuItem = ({ key, label, subLabel, icon }, isSelected, callback) => (
  <TouchableHighlight
    analyticsLabel={`Navigation Menu: ${label}`}
    onPress={() => callback(key)}
    key={key}
  >
    <View style={[localStyles.menuItem, isSelected ? localStyles.menuItemSelected : null]}>
      {icon ? (
        <View style={localStyles.menuItemIcon}>
          <Icon name={icon} color={THEME_COLOR_SIDEMENU_ICON} size={24} />
        </View>
      ) : null}
      <View style={localStyles.menuItemLabel}>
        <Text
          style={[localStyles.menuItemText, isSelected ? localStyles.menuItemSelectedText : null]}
        >
          {label}
        </Text>
        {subLabel ? (
          <Text style={[localStyles.menuItemText, localStyles.menuItemSubText]}>{subLabel}</Text>
        ) : null}
      </View>
    </View>
  </TouchableHighlight>
);

const renderNavSection = (section, sectionIndex, selectedItem, onSelectItem) => {
  const items = section.filter(menuItem => !menuItem.disabled);

  if (items.length === 0) {
    return null;
  }

  return (
    <View
      style={[localStyles.section, sectionIndex !== 0 ? localStyles.sectionBorder : {}]}
      key={`section-${sectionIndex}`}
    >
      {items.map(menuItem => renderMenuItem(menuItem, menuItem.key === selectedItem, onSelectItem))}
    </View>
  );
};

const renderNavigationDrawer = (name, coconuts, pigs, sections, onSelectItem, selectedItem) => (
  <View style={localStyles.drawerWrapper}>
    <View style={localStyles.top}>
      <View style={localStyles.user}>
        <Text style={localStyles.userDetail}>{name}</Text>
        <View style={localStyles.userSubDetail}>
          <Coconut size={REWARD_ICON_SIZE} />
          <Text style={localStyles.rewardText}>{coconuts}</Text>
          <Pig size={REWARD_ICON_SIZE} />
          <Text style={localStyles.rewardText}>{pigs}</Text>
        </View>
      </View>
    </View>
    <ScrollView style={localStyles.menuItems}>
      {sections.map((section, sectionIndex) =>
        renderNavSection(section, sectionIndex, selectedItem, onSelectItem),
      )}
    </ScrollView>
  </View>
);

export const NavigationMenu = ({
  children,
  isOpen,
  onToggleSideMenu,
  onSelectItem,
  selectedItem,
  name,
  coconuts,
  pigs,
  sections,
}) => (
  <SideMenu
    menu={renderNavigationDrawer(name, coconuts, pigs, sections, onSelectItem, selectedItem)}
    isOpen={isOpen}
    onChange={onToggleSideMenu}
    disableGestures={!isOpen}
    menuPosition="right"
  >
    {children}
    {isOpen ? <View style={localStyles.overlay} /> : null}
  </SideMenu>
);

NavigationMenu.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggleSideMenu: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired,
  selectedItem: PropTypes.string,
  name: PropTypes.string,
  coconuts: PropTypes.number,
  pigs: PropTypes.number,
  sections: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        label: PropTypes.string,
        subLabel: PropTypes.string,
        icon: PropTypes.string,
      }),
    ),
  ),
};

const localStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
    backgroundColor: THEME_COLOR_SIX,
  },
  drawerWrapper: {
    flex: 1,
    backgroundColor: THEME_COLOR_ONE,
  },
  top: {
    backgroundColor: THEME_COLOR_LIGHT,
    paddingTop: Platform.OS === 'ios' ? 20 : 0, // Compensate for iOS statusbar
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLOR_FOUR,
  },
  section: {
    paddingVertical: 6,
  },
  sectionBorder: {
    borderTopWidth: 1,
    borderTopColor: THEME_COLOR_FOUR,
  },
  user: {
    paddingHorizontal: DEFAULT_PADDING,
    width: '100%',
    paddingVertical: 14,
  },
  userDetail: {
    color: THEME_TEXT_COLOR_THREE,
    fontSize: THEME_FONT_SIZE_TWO,
    marginBottom: 10,
    fontWeight: '500',
    alignItems: 'center',
  },
  userSubDetail: {
    alignItems: 'center',
    flexDirection: 'row',
    opacity: 0.8,
    marginTop: 2,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: THEME_COLOR_ONE,
    padding: 15,
    alignItems: 'center',
  },
  menuItemSelected: {
    backgroundColor: THEME_COLOR_LIGHT,
  },
  menuItemLabel: {
    flex: 1,
  },
  menuItemText: {
    color: THEME_TEXT_COLOR_THREE,
    fontSize: 14,
    // Android has an issue with font weights >400 in RN
    // which defaults it to using bold fonts instead of
    // medium fonts.
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  menuItemSelectedText: {
    color: THEME_COLOR_TWO,
  },
  menuItemSubText: {
    opacity: 0.7,
  },
  menuItemIcon: {
    width: 35,
  },
  rewardText: {
    color: THEME_TEXT_COLOR_THREE,
    fontWeight: 'bold',
    marginRight: 20,
    marginLeft: 5,
  },
});
