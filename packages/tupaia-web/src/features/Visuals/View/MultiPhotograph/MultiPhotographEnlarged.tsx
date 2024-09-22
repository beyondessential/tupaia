/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ViewConfig, ViewReport } from '@tupaia/types';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { IconButton, Typography } from '@material-ui/core';
import { useParams, useSearchParams } from 'react-router-dom';
import { SmallAlert } from '@tupaia/ui-components';
import { URL_SEARCH_PARAMS } from '../../../../constants';
import { useDashboard } from '../../../Dashboard';
import { useDownloadImages } from './useDownloadImages';
import { ExportIconButton } from '../../../EnlargedDashboardItem';

const Wrapper = styled.div`
  position: relative;
  width: 75rem;
  max-width: 90%;
  margin: 0 auto;
`;

const MainSliderContainer = styled.div`
  max-width: 37rem;
  margin: 0 auto;
`;

const ThumbSliderContainer = styled.div`
  max-width: 65rem;
  margin: 0 auto;
`;

const Image = styled.div<{
  url?: string;
}>`
  background-image: url(${({ url }) => url});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Slide = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainSlide = styled(Slide)`
  width: 100%;
  height: 35rem;
  padding-block-start: 1rem;
  padding-block-end: 3.5rem;
  padding-inline: 1.5rem;
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
    background-size: cover;
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
  const { data = [] } = report ?? {};
  const [urlSearchParams] = useSearchParams();

  /**  The following is a workaround for an issue where the slider doesn't link the two sliders together until another re-render, because the ref is not set yet
   * See [example](https://react-slick.neostack.com/docs/example/as-nav-for)
   **/

  const sliderRef1 = useRef(null);
  const sliderRef2 = useRef(null);
  const [mainSlider, setMainSlider] = useState(null);
  const [thumbnailSlider, setThumbnailSlider] = useState(null);

  const reportCode = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT);
  const { projectCode, entityCode } = useParams();
  const { activeDashboard } = useDashboard();

  const {
    mutate: downloadImages,
    isLoading,
    error,
  } = useDownloadImages(projectCode, entityCode, activeDashboard?.code, reportCode, data);

  useEffect(() => {
    if (!sliderRef1.current || mainSlider) return;
    setMainSlider(sliderRef1.current);
  }, [sliderRef1.current]);

  useEffect(() => {
    if (!sliderRef2.current || thumbnailSlider) return;
    setThumbnailSlider(sliderRef2.current);
  }, [sliderRef2.current]);

  // END of workaround

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

  const getResponsiveSettingForBreakpoint = (breakpoint, maxSlides, isMainSlider) => {
    const thumbCount = getThumbsToShow(maxSlides);
    // only show arrows and allow infinite scrolling if there are more thumbnails than can be displayed
    const isInfinite = data.length > thumbCount;
    return {
      breakpoint,
      settings: {
        slidesToShow: isMainSlider ? 1 : thumbCount,
        infinite: isInfinite,
        arrows: isMainSlider ? true : isInfinite,
      },
    };
  };

  const responsiveArr = [
    { breakpoint: 400, maxSlides: 3 },
    { breakpoint: 600, maxSlides: 6 },
    {
      breakpoint: 800,
      maxSlides: 8,
    },
  ];

  // settings for the thumbnail slider to reduce the number of thumbnails shown on smaller screens
  const thumbnailResponsiveSettings = responsiveArr.map(({ breakpoint, maxSlides }) =>
    getResponsiveSettingForBreakpoint(breakpoint, maxSlides, false),
  );

  const mainSliderResponsiveSettings = responsiveArr.map(({ breakpoint, maxSlides }) =>
    getResponsiveSettingForBreakpoint(breakpoint, maxSlides, true),
  );

  const hasMoreThumbnails = data.length > maxThumbnailsToDisplay;

  return (
    <>
      <ExportIconButton
        onClick={() => downloadImages()}
        isLoading={isLoading}
        title="Export images"
      />

      <Wrapper>
        <MainSliderContainer>
          {error && <SmallAlert severity="error">{(error as Error).message}</SmallAlert>}
          <Slider
            {...settings}
            asNavFor={thumbnailSlider}
            ref={sliderRef1}
            slidesToShow={1}
            arrows
            infinite={hasMoreThumbnails}
            responsive={mainSliderResponsiveSettings}
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
        </MainSliderContainer>

        <ThumbSliderContainer>
          <Slider
            {...settings}
            asNavFor={mainSlider}
            ref={sliderRef2}
            slidesToShow={maxThumbnailsToDisplay}
            focusOnSelect
            infinite={hasMoreThumbnails}
            arrows={hasMoreThumbnails}
            responsive={thumbnailResponsiveSettings}
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
        </ThumbSliderContainer>
      </Wrapper>
    </>
  );
};
