import React from 'react';
import PropTypes from 'prop-types';
import { FavouriteButton as FavouriteButtonComponent } from '@tupaia/ui-components';
import { IDLE, IS_FAVOURITE } from '../constants';

export const FavouriteButton = ({ favouriteStatus, handleFavouriteStatusChange }) => {
  if (favouriteStatus === IDLE) {
    return null;
  }

  const isFavourite = favouriteStatus === IS_FAVOURITE;

  return (
    favouriteStatus !== IDLE && (
      <FavouriteButtonComponent
        isFavourite={isFavourite}
        onChange={handleFavouriteStatusChange}
        color={isFavourite ? 'primary' : 'default'}
      />
    )
  );
};

FavouriteButton.propTypes = {
  favouriteStatus: PropTypes.string.isRequired,
  handleFavouriteStatusChange: PropTypes.func,
};

FavouriteButton.defaultProps = {
  handleFavouriteStatusChange: () => {},
};
