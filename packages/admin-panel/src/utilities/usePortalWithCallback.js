/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import ReactDOM from 'react-dom';

export const usePortalWithCallback = (Component, callback) => {
  const [el, setEl] = React.useState(null);

  React.useEffect(() => {
    const ref = callback();
    setEl(ref.current);
  }, [callback]);

  return el && ReactDOM.createPortal(Component, el);
};
