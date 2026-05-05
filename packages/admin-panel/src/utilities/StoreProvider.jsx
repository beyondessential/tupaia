import React from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { rootReducer } from '../rootReducer';
import {
  selectSelectedProject,
  writePersistedProject,
  setCurrentProjectId,
} from '../projects';

const initialState = {};
const enhancers = [];

if (import.meta.env.DEV) {
  const { __REDUX_DEVTOOLS_EXTENSION__ } = window;
  if (typeof __REDUX_DEVTOOLS_EXTENSION__ === 'function') {
    enhancers.push(__REDUX_DEVTOOLS_EXTENSION__());
  }
}

export const StoreProvider = React.memo(({ children, api }) => {
  const middleware = [thunk.withExtraArgument({ api })];
  const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);
  const store = createStore(rootReducer, initialState, composedEnhancers);

  let lastPersistedProject = selectSelectedProject(store.getState());
  setCurrentProjectId(lastPersistedProject?.id ?? null);
  store.subscribe(() => {
    const project = selectSelectedProject(store.getState());
    if (project !== lastPersistedProject) {
      lastPersistedProject = project;
      writePersistedProject(project);
      setCurrentProjectId(project?.id ?? null);
    }
  });

  api.injectReduxStore(store);

  return <Provider store={store}>{children}</Provider>;
});

StoreProvider.propTypes = {
  api: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};
