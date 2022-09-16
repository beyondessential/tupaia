import React from 'react';
import PropTypes from 'prop-types';
import { FavouriteButton as FavouriteButtonComponent, Tooltip } from '@tupaia/ui-components';
import { useUser } from '../api';

export const FavouriteButton = ({ isFavourite, handleFavouriteStatusChange }) => {
  const { isLoggedIn } = useUser();
  if (!isLoggedIn || isFavourite === null) {
    return (
      <Tooltip title="Log in/sign up to save favourites">
        <span>
          <FavouriteButtonComponent isDisabled />
        </span>
      </Tooltip>
    );
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
  isFavourite: PropTypes.bool,
  handleFavouriteStatusChange: PropTypes.func,
};

FavouriteButton.defaultProps = {
  handleFavouriteStatusChange: () => {},
  isFavourite: null,
};
