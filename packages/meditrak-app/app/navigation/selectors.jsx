import { SURVEY_SCREEN } from './constants';

const getCurrentRoute = ({ nav }) => (nav.routes ? nav.routes[nav.index] : {});

export const getCurrentRouteName = state => getCurrentRoute(state).routeName;

export const getIsInSurvey = state => getCurrentRouteName(state) === SURVEY_SCREEN;
