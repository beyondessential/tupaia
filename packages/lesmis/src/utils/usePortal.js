/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import ReactDOM from 'react-dom';

/**
 * A util which renders a component to the ref that the callback returns
 *
 * @param Component - a react component
 * @param callback - a function that returns a ref to a dom node
 *
 */
export const usePortal = (Component, callback) => {
  const [el, setEl] = React.useState(null);

  React.useEffect(() => {
    const ref = callback();
    setEl(ref.current);
  }, [callback]);

  return el && ReactDOM.createPortal(Component, el);
};
