import { ButtonBase, Dialog } from '@material-ui/core';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Image } from './Image';

const Button = styled(ButtonBase)`
  inline-size: 100%;
`;

const getOrgUnitPhotoUrl = (photoUrl?: string) => {
  if (!photoUrl) {
    return undefined;
  }

  const dir = photoUrl.includes('dev_uploads') ? 'dev_uploads' : 'uploads';

  return photoUrl.replace(`/${dir}/`, `/thumbnails/${dir}/`).replace('.png', '.jpg');
};

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
        <Dialog open={isEnlarged} onClose={() => setIsEnlarged(false)}>
          <img crossOrigin="" src={imageSrc} alt={title} />
        </Dialog>
      )}
      <ButtonBase
        aria-label="Expand image"
        onClick={() => setIsEnlarged(true)}
        title="Expand image"
        style={{ inlineSize: '100%' }}
      >
        <Image alt={title} src={imageSrc} />
      </ButtonBase>
    </>
  );
};
