/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ViewConfig, ViewReport } from '@tupaia/types';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { IconButton, Typography } from '@material-ui/core';

const Wrapper = styled.div`
  position: relative;
  padding: 1rem;
`;

const Image = styled.div<{
  url?: string;
}>`
  background-image: url(${({ url }) => url});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Slide = styled.div`
  display: flex;
  flex-direction: column;
  width: 32rem;
  height: 35rem;
  padding-block: 1rem;
  padding-inline: 2rem;
  max-width: 32rem;
`;

const Caption = styled(Typography)`
  text-align: left;
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-block-start: 0.3rem;
`;

const ArrowButton = styled(IconButton)`
  padding: 1rem;
  display: flex;
  color: ${({ theme }) => theme.palette.text.primary};
  // ignore the default arrow icon
  &:before {
    content: '';
  }
  &:hover,
  &:focus-within {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const Thumbnail = styled(Slide)`
  width: 5rem !important;
  height: 5rem;
  padding: 0.4rem;
`;

interface ArrowIconWrapperProps extends Record<string, unknown> {
  left?: boolean;
  style?: Record<string, string>;
}

const ArrowIconWrapper = ({ style, ...props }: ArrowIconWrapperProps) => {
  const Icon = props.left ? KeyboardArrowLeft : KeyboardArrowRight;
  return (
    <ArrowButton {...props}>
      <Icon />
    </ArrowButton>
  );
};

interface MultiPhotographEnlargedProps {
  report: ViewReport;
  config: ViewConfig;
}

export const MultiPhotographEnlarged = ({ report, config }: MultiPhotographEnlargedProps) => {
  const data = [...report?.data, ...report?.data, ...report?.data];
  const sliderRef1 = useRef(null);
  const sliderRef2 = useRef(null);

  const settings = {
    infinite: false,
    speed: 500,
    prevArrow: <ArrowIconWrapper left />,
    nextArrow: <ArrowIconWrapper />,
  };

  const maxThumbnailsToDisplay = Math.min(data?.length ?? 12, 12);
  return (
    <Wrapper>
      <Slider {...settings} asNavFor={sliderRef2?.current} ref={sliderRef1} slidesToShow={1}>
        {data?.map((photo, index) => (
          <Slide key={photo.value}>
            <Image
              url={photo.value}
              title={photo.label || `Image ${index + 1} for visualisation ${config?.name}`}
            />
            {photo.label && <Caption>{photo.label}</Caption>}
          </Slide>
        ))}
      </Slider>
      <Slider
        {...settings}
        asNavFor={sliderRef1?.current}
        ref={sliderRef2}
        slidesToShow={maxThumbnailsToDisplay}
        focusOnSelect
        arrows={maxThumbnailsToDisplay < data?.length}
      >
        {data?.map((photo, index) => (
          <Thumbnail key={photo.value}>
            <Image
              url={photo.value}
              title={photo.label || `Image ${index + 1} for visualisation ${config?.name}`}
            />
          </Thumbnail>
        ))}
      </Slider>
    </Wrapper>
  );
};
