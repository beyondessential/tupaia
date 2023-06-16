/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, ButtonBase } from '@material-ui/core';
import { Modal } from '../../components';
import { Media } from './Media';

const getOrgUnitPhotoUrl = (photoUrl?: string) => {
  if (!photoUrl) {
    return undefined;
  }

  const dir = photoUrl.includes('dev_uploads') ? 'dev_uploads' : 'uploads';

  return photoUrl.replace(`/${dir}/`, `/thumbnails/${dir}/`).replace('.png', '.jpg');
};

export const ModalImage = styled.img`
  margin: 3rem;
`;

interface PhotoProps {
  title?: string;
  photoUrl?: string;
}
export const Photo = ({ title, photoUrl }: PhotoProps) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const imageSrc = getOrgUnitPhotoUrl(photoUrl);

  return (
    <>
      {isEnlarged && (
        <Modal isOpen={isEnlarged} onClose={() => setIsEnlarged(false)}>
          <Typography variant="h3">{title}</Typography>
          <ModalImage src={imageSrc} alt={title} />
        </Modal>
      )}
      <Media $backgroundImage={imageSrc} onClick={() => setIsEnlarged(true)} as={ButtonBase} />
    </>
  );
};
