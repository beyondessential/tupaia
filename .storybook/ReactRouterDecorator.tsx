import React, { useEffect } from 'react';
import { action } from '@storybook/addon-actions';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Args } from '@storybook/react';
import { DecoratorFunction } from '@storybook/csf';

const LocationChangeAction = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.key !== 'default') action('React Router Location Change')(location);
  }, [location]);

  return <>{children}</>;
};

const ReactRouterDecorator: DecoratorFunction<any, Args> = (Story, context) => {
  return (
    <BrowserRouter>
      <LocationChangeAction>
        <Story {...context} />
      </LocationChangeAction>
    </BrowserRouter>
  );
};

export default ReactRouterDecorator;
