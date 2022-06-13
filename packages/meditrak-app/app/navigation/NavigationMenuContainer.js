/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { connect } from 'react-redux';

import { NavigationMenu } from './NavigationMenu';
import { toggleSideMenu, selectSideMenuItem } from './actions';
import {
  SURVEYS_MENU_SCREEN,
  HOME_SCREEN,
  REALM_EXPLORER_SCREEN,
  REQUEST_COUNTRY_ACCESS_SCREEN,
  CHANGE_PASSWORD_SCREEN,
} from './constants';

const DEVELOPER_EMAIL_ADDRESSES = [
  // To add realm database explorer to the menu
  'edmofro@gmail.com',
];

function mapStateToProps({ sideMenu, authentication, nav, rewards }) {
  const { isOpen } = sideMenu;
  const { emailAddress, name } = authentication;
  const { routes } = nav;
  const { pigs, coconuts } = rewards;

  const sections = [
    [
      {
        key: HOME_SCREEN,
        label: 'Home',
        icon: 'home',
      },
      {
        key: SURVEYS_MENU_SCREEN,
        label: 'Survey a facility',
        icon: 'pencil',
      },
    ],
    [
      {
        key: REQUEST_COUNTRY_ACCESS_SCREEN,
        label: 'Request access to new countries',
        icon: 'globe',
      },
      {
        key: CHANGE_PASSWORD_SCREEN,
        label: 'Change password',
        icon: 'lock',
      },
      {
        key: 'logout',
        label: 'Log out',
        icon: 'sign-out',
      },
    ],
  ];

  if (__DEV__ || DEVELOPER_EMAIL_ADDRESSES.includes(emailAddress)) {
    sections.push([
      {
        key: REALM_EXPLORER_SCREEN,
        label: 'Realm Explorer',
        icon: 'database',
      },
    ]);
  }

  let selectedItem = null;
  routes.forEach(({ routeName }) => {
    sections.forEach(section =>
      section.forEach(item => {
        if (routeName === item.key) {
          selectedItem = item.key;
        }
      }),
    );
  });

  return {
    isOpen,
    selectedItem,
    emailAddress,
    name,
    sections,
    pigs,
    coconuts,
  };
}

function mergeProps(stateProps, { dispatch }, ownProps) {
  const { ...restOfState } = stateProps;
  return {
    ...ownProps,
    ...restOfState,
    onSelectItem: itemKey => dispatch(selectSideMenuItem(itemKey)),
    onToggleSideMenu: isOpen => dispatch(toggleSideMenu(isOpen)),
  };
}

const NavigationMenuContainer = connect(mapStateToProps, null, mergeProps)(NavigationMenu);

export { NavigationMenuContainer };
