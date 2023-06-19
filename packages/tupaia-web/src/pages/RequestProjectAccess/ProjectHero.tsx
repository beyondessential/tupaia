/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { SingleProject } from '../../types';

const FullWidth = styled.div`
  width: calc(100% + 4rem);
  margin-left: -2rem;
`;

const HeadingWrapper = styled.div`
  padding: 1rem 2rem;
  background-color: rgba(0, 0, 0, 0.2);
`;

const Heading = styled.h2`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  text-align: left;
  margin: 0;
`;

const HeroImage = styled.div<{
  src: string;
}>`
  width: 100%;
  height: 15rem;
  background-image: ${({ src }) => `url(${src})`};
  position: relative;
  background-size: cover;
`;

const LogoImage = styled.div<{
  src: string;
}>`
  position: absolute;
  width: 8.2rem;
  height: 4.7rem;
  background-color: ${({ theme }) => theme.palette.common.white};
  background-image: ${({ src }) => (src ? `url(${src})` : 'none')};
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  bottom: -1.9rem;
  right: 2.5rem;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.25);
  border-radius: 3px;
  overflow: hidden;
`;

interface ProjectHeroProps {
  project?: SingleProject;
}

export const ProjectHero = ({ project }: ProjectHeroProps) => {
  return (
    <FullWidth>
      <HeadingWrapper>
        <Heading>Requesting Project Access</Heading>
      </HeadingWrapper>
      <HeroImage src={project?.imageUrl || ''} aria-hidden={true}>
        {project?.logoUrl && <LogoImage src={project.logoUrl} />}
      </HeroImage>
    </FullWidth>
  );
};
