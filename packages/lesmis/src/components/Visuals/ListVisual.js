/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ListVisual as ListVisualComponent } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import { VisualHeader } from './VisualHeader';

export const ListVisual = props => {
  const { name, isEnlarged } = props;
  return (
    <>
      {!isEnlarged && <VisualHeader name={name} />}
      <ListVisualComponent {...props} />
    </>
  );
};

ListVisual.propTypes = {
  isEnlarged: PropTypes.bool,
  name: PropTypes.string,
};

ListVisual.defaultProps = {
  isEnlarged: false,
  name: null,
};
