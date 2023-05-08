/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { request } from '../../utils';

// This will need to be replaced with real data when it's ready. @see waitp-1195
const customLandingPages = [
  {
    name: 'Fiji',
    urlSegment: 'landing-page-fiji',
    projects: ['wish'],
    image_url: 'https://placehold.co/2000x2000',
    logo_url: 'https://placehold.co/800x800',
    include_name_in_header: true,
    primary_hexcode: 'pink',
    extended_title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    long_bio:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    external_link: 'https://www.bes.au',
    phone_number: '+123 456 789',
    website_url: 'https://www.bes.au',
  },
];

function useLandingPagesData() {
  const urlSegment = useSelector(state => state.routing.pathname);
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const results = await request(`landingPage${urlSegment}`);
        setData(results);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  console.log('data', data);

  return { data, isLoading, isError: !!error, error };
}

function getLandingPageProjects(landingPage, projects) {
  if (!landingPage) {
    return [];
  }
  return projects.filter(project => landingPage.projects.includes(project.code));
}
export const useCustomLandingPages = () => {
  const projectData = useSelector(({ project }) => project?.projects || []);
  const { data: customLandingPage, isLoading, isError, error } = useLandingPagesData();

  console.log('customLandingPage', customLandingPage);

  return {
    isLoading,
    isError,
    error,
    isCustomLandingPage: !!customLandingPage,
    projects: getLandingPageProjects(customLandingPage, projectData),
    customLandingPageSettings: customLandingPage || {},
  };
};
