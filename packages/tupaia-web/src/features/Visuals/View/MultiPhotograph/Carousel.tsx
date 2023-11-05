/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { ViewReport } from '@tupaia/types';
import { Modal } from '../../../../components';
import { IconButton, Slide } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';

const Wrapper = styled.div`
  overflow-y: auto;
  max-width: 38rem;
  width: 100%;
  padding: 0 1rem;
  flex: 1;
  display: flex;
`;

const ImageWrapper = styled.div`
  overflow: hidden;
  width: 100%;
  min-height: 30rem;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Image = styled.img<{
  $isActive: boolean;
}>`
  max-width: 100%;
  height: auto;
  max-height: 100%;
  display: ${({ $isActive }) => ($isActive ? 'block' : 'none')};
  margin: 0 auto;
`;

const ArrowButton = styled(IconButton)`
  position: absolute;
  top: 45%;
  z-index: 1;
  &:first-child {
    left: 0.5rem;
  }
  &:last-child {
    right: 0.5rem;
  }
  svg {
    width: 3rem;
    height: 3rem;
  }
`;

interface CarouselProps {
  report: ViewReport;
  onClose: () => void;
}

export const Carousel = ({ report: { data = [] }, onClose }: CarouselProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const handleNext = () => {
    if (activeImageIndex === data.length - 1) return;
    setSlideDirection('right');
    setActiveImageIndex(activeImageIndex + 1);
  };
  const handlePrevious = () => {
    if (activeImageIndex === 0) return;
    setSlideDirection('left');
    setActiveImageIndex(activeImageIndex - 1);
  };

  if (!data[activeImageIndex]) return null;
  return (
    <Modal isOpen onClose={onClose}>
      <Wrapper>
        <ImageWrapper>
          {data.map((image, index) => (
            <Slide
              direction={slideDirection}
              in={activeImageIndex === index}
              key={index}
              timeout={500}
            >
              <Image src={image.value} key={index} $isActive={activeImageIndex === index} />
            </Slide>
          ))}
        </ImageWrapper>
        {data.length > 1 && (
          <>
            <ArrowButton onClick={handlePrevious} disabled={activeImageIndex === 0}>
              <KeyboardArrowLeft />
            </ArrowButton>
            <ArrowButton onClick={handleNext} disabled={activeImageIndex === data.length - 1}>
              <KeyboardArrowRight />
            </ArrowButton>
          </>
        )}
      </Wrapper>
    </Modal>
  );
};
