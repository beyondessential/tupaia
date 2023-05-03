import React from 'react';
import { useCustomLandingPages } from './useCustomLandingPages';
import { useAuth } from './useAuth';

export function SingleProjectLandingPage() {
  const { projects } = useCustomLandingPages();
  const { isUserLoggedIn } = useAuth();
  const project = projects[0];
  return <div>SingleProjectLandingPage</div>;
}
