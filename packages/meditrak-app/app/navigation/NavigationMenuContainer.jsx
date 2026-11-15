import { connect } from 'react-redux';

import { NavigationMenu } from './NavigationMenu';
import { toggleSideMenu, selectSideMenuItem } from './actions';
import {
  SURVEYS_MENU_SCREEN,
  HOME_SCREEN,
  REALM_EXPLORER_SCREEN,
  REQUEST_COUNTRY_ACCESS_SCREEN,
  CHANGE_PASSWORD_SCREEN,
  DELETE_ACCOUNT_REQUEST_SCREEN,
} from './constants';

const DEVELOPER_EMAIL_ADDRESSES = [
  // To add realm database explorer to the menu
  'edmofro@gmail.com',
];

/**
 * These must keep a stable reference between calls to mapStateToProps. This container is an
 * ancestor of every screen, so if its mapped props look changed on every Redux action, react-redux
 * delays the store update to everything beneath it by one render. Controlled text inputs then get
 * a stale value for a render, which makes the cursor drift back when editing mid-text on Android.
 */
const SECTIONS = /** @type {const} */ ([
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
      key: DELETE_ACCOUNT_REQUEST_SCREEN,
      label: 'Delete account',
      icon: 'remove',
    },

    {
      key: 'logout',
      label: 'Log out',
      icon: 'sign-out',
    },
  ],
]);

const SECTIONS_WITH_REALM_EXPLORER = /** @type {const} */ ([
  ...SECTIONS,
  [
    {
      key: REALM_EXPLORER_SCREEN,
      label: 'Realm Explorer',
      icon: 'database',
    },
  ],
]);

function mapStateToProps({ sideMenu, authentication, nav, rewards }) {
  const { isOpen } = sideMenu;
  const { emailAddress, name } = authentication;
  const { routes } = nav;
  const { pigs, coconuts } = rewards;

  const sections =
    __DEV__ || DEVELOPER_EMAIL_ADDRESSES.includes(emailAddress)
      ? SECTIONS_WITH_REALM_EXPLORER
      : SECTIONS;

  let selectedItem = null;
  for (const { routeName } of routes) {
    for (const section of sections) {
      for (const item of section) {
        if (routeName === item.key) {
          selectedItem = item.key;
        }
      }
    }
  }

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
