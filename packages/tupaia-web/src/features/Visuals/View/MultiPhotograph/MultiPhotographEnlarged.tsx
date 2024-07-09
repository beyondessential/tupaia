/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { ViewConfig, ViewReport } from '@tupaia/types';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { IconButton, Typography } from '@material-ui/core';

const Wrapper = styled.div`
  position: relative;
  padding: 1rem;
  max-width: 75rem;
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
`;

const MainSlide = styled(Slide)`
  width: 32rem;
  height: 35rem;
  padding-block: 1rem;
  padding-inline: 2rem;
  max-width: 32rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-inline: 0.5rem;
  }
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
  &.slick-disabled {
    pointer-events: none;
    opacity: 0.5;
  }
`;

const Thumbnail = styled(Slide)<{
  $thumbCount: number;
}>`
  padding: 0.4rem;
  height: 100%;
  width: 100%;
  max-height: 100%;
  max-width: 100%;
  ${Image} {
    border-radius: 3px;
    .slick-current & {
      border: 2px solid ${({ theme }) => theme.palette.text.primary};
    }
    &:hover {
      border: 1px solid ${({ theme }) => theme.palette.text.primary};
    }
  }
  .slick-slide:has(&) {
    width: ${({ $thumbCount }) =>
      `calc(100% / ${$thumbCount}) !important`}; // This is to override the default width set by slick-carousel, and needs to be !important to take effect because slick applies this inline
    max-width: 7rem;
    height: auto;
    aspect-ratio: 1 / 1;
    display: flex;
    > div {
      height: 100%;
      width: 100%;
    }
  }
  .slick-track:has(&) {
    display: flex;
    justify-content: center;
    
`;

interface ArrowIconWrapperProps extends Record<string, unknown> {
  left?: boolean;
  style?: Record<string, string>;
}

const ArrowIconWrapper = ({ style, left, ...props }: ArrowIconWrapperProps) => {
  const Icon = left ? KeyboardArrowLeft : KeyboardArrowRight;
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
  //  const { data = [] } = report ?? {};

  const data = [...report.data, ...report.data, ...report.data, ...report.data, ...report.data];

  /**  The following is a workaround for an issue where the slider doesn't link the two sliders together until another re-render, because the ref is not set yet
   * See [example](https://react-slick.neostack.com/docs/example/as-nav-for)
   **/

  const sliderRef1 = useRef(null);
  const sliderRef2 = useRef(null);
  const [mainSlider, setMainSlider] = useState(null);
  const [thumbnailSlider, setThumbnailSlider] = useState(null);

  useEffect(() => {
    if (!sliderRef1.current || mainSlider) return;
    setMainSlider(sliderRef1.current);
  }, [sliderRef1.current]);

  useEffect(() => {
    if (!sliderRef2.current || thumbnailSlider) return;
    setThumbnailSlider(sliderRef2.current);
  }, [sliderRef2.current]);

  const getThumbsToShow = max => {
    return Math.min(max, data.length);
  };

  const maxThumbnailsToDisplay = getThumbsToShow(12);

  const settings = {
    speed: 500,
    prevArrow: <ArrowIconWrapper left />,
    nextArrow: <ArrowIconWrapper />,
    slidesToScroll: 1,
    swipeToSlide: true,
  };

  const getResponsiveSettingForBreakpoint = (breakpoint, maxSlides) => {
    const thumbCount = getThumbsToShow(maxSlides);
    const isInfinite = data.length > thumbCount;
    return {
      breakpoint,
      settings: { slidesToShow: thumbCount, infinite: isInfinite, arrows: isInfinite },
    };
  };

  const responsiveSettings = [
    { breakpoint: 400, maxSlides: 4 },
    { breakpoint: 600, maxSlides: 6 },
    {
      breakpoint: 800,
      maxSlides: 8,
    },
  ].map(({ breakpoint, maxSlides }) => getResponsiveSettingForBreakpoint(breakpoint, maxSlides));

  const hasMoreThumbnails = data.length > maxThumbnailsToDisplay;

  return (
    <Wrapper>
      <Slider
        {...settings}
        asNavFor={thumbnailSlider}
        ref={sliderRef1}
        slidesToShow={1}
        infinite={hasMoreThumbnails}
      >
        {data.map((photo, index) => (
          <MainSlide key={photo.value}>
            <Image
              url={photo.value}
              title={photo.label || `Image ${index + 1} for visualisation ${config?.name}`}
            />
            {photo.label && <Caption>{photo.label}</Caption>}
          </MainSlide>
        ))}
      </Slider>
      <Slider
        {...settings}
        asNavFor={mainSlider}
        ref={sliderRef2}
        slidesToShow={maxThumbnailsToDisplay}
        focusOnSelect
        responsive={responsiveSettings}
        infinite={hasMoreThumbnails}
        arrows={hasMoreThumbnails}
      >
        {data?.map((photo, index) => (
          <Thumbnail key={photo.value} $thumbCount={maxThumbnailsToDisplay}>
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
