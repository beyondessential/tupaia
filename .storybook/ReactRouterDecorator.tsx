import React, { useEffect } from 'react';
import { action } from 'storybook/actions';
import { BrowserRouter, useLocation } from 'react-router-dom';
import type { Args, Decorator } from '@storybook/react-vite';

const LocationChangeAction = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.key !== 'default') action('React Router Location Change')(location);
  }, [location]);

  return <>{children}</>;
};

const ReactRouterDecorator: Decorator<Args> = (Story, context) => {
  return (
    <BrowserRouter>
      <LocationChangeAction>
        <Story {...context} />
      </LocationChangeAction>
    </BrowserRouter>
  );
};

export default ReactRouterDecorator;
