/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ListVisual as ListVisualComponent } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import { VisualHeader } from './VisualHeader';
import { FavouriteButton } from '../FavouriteButton';

export const ListVisual = props => {
  const { name, isEnlarged, favouriteStatus, handleFavouriteStatusChange } = props;

  return (
    <>
      {!isEnlarged && (
        <VisualHeader name={name}>
          <FavouriteButton
            favouriteStatus={favouriteStatus}
            handleFavouriteStatusChange={handleFavouriteStatusChange}
          />
        </VisualHeader>
      )}
      <ListVisualComponent {...props} />
    </>
  );
};

ListVisual.propTypes = {
  isEnlarged: PropTypes.bool,
  name: PropTypes.string,
  favouriteStatus: PropTypes.string.isRequired,
  handleFavouriteStatusChange: PropTypes.func,
};

ListVisual.defaultProps = {
  isEnlarged: false,
  name: null,
  handleFavouriteStatusChange: () => {},
};
