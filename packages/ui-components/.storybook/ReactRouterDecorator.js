import React, { useEffect } from 'react';
import { action } from '@storybook/addon-actions';
import { BrowserRouter, useLocation } from 'react-router-dom';

const LocationChangeAction = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.key !== 'default') action('React Router Location Change')(location);
  }, [location]);

  return <>{children}</>;
};

const ReactRouterDecorator = (Story, context) => {
  return (
    <BrowserRouter>
      <LocationChangeAction>
        <Story {...context} />
      </LocationChangeAction>
    </BrowserRouter>
  );
};

export default ReactRouterDecorator;
