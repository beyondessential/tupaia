/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useParams, useLoaderData } from 'react-router-dom';
import { get } from '../api';

export async function loader({ params }) {
  const { projects } = await get('projects');
  return projects.find(p => p.code === params.code);
}
export const Project = () => {
  console.log('mount');
  // Use these to fetch the project and any other entity info you might need
  const { code, entityCode } = useParams();
  const { description } = useLoaderData();
  console.log('description', description);

  return (
    <div>
      <h1>Project: {code}</h1>
      <h2>Entity: {entityCode}</h2>
      <p>Description: {description}</p>
    </div>
  );
};
