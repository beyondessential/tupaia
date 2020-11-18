/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

/**
 * Helper function to take react components to be used as screens in the app, and generate a
 * StackNavigator routes config object with the class name as route name
 */
export const getRoutesFromScreens = screens => {
  const routes = {};
  screens.forEach(screen => {
    routes[screen.constructor.name] = { screen };
  });
};
