import { TOGGLE_SIDE_MENU } from './constants';
import { createReducer } from '../utilities';

const sideMenuDefaultState = {
  isOpen: false,
};

const sideMenuStateChanges = {
  [TOGGLE_SIDE_MENU]: ({ isOpen }) => ({
    isOpen,
  }),
};

export const sideMenuReducer = createReducer(sideMenuDefaultState, sideMenuStateChanges);
