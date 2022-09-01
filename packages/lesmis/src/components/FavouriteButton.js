import React from 'react';
import PropTypes from 'prop-types';
import { FavouriteButton as FavouriteButtonComponent } from '@tupaia/ui-components';
import { useUser } from '../api';

export const FavouriteButton = ({ isFavourite, handleFavouriteStatusChange }) => {
  const { isLoggedIn } = useUser();
  if (!isLoggedIn) {
    return null;
  }

  return (
    <FavouriteButtonComponent
      isFavourite={isFavourite}
      onChange={handleFavouriteStatusChange}
      color={isFavourite ? 'primary' : 'default'}
    />
  );
};

FavouriteButton.propTypes = {
  isFavourite: PropTypes.bool.isRequired,
  handleFavouriteStatusChange: PropTypes.func,
};

FavouriteButton.defaultProps = {
  handleFavouriteStatusChange: () => {},
};
