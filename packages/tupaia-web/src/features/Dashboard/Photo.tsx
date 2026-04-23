import { ButtonBase, Dialog } from '@material-ui/core';
import React, { useState } from 'react';
import { Image } from './Image';

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
  const thumbUrl = getOrgUnitPhotoUrl(photoUrl);

  return (
    <>
      {isEnlarged && (
        <Dialog open={isEnlarged} onClose={() => setIsEnlarged(false)}>
          <img crossOrigin="" src={thumbUrl} alt={title} />
        </Dialog>
      )}
      <ButtonBase
        aria-label="Expand image"
        onClick={() => setIsEnlarged(true)}
        title="Expand image"
        style={{ inlineSize: '100%' }}
      >
        <Image alt={title} src={photoUrl} />
      </ButtonBase>
    </>
  );
};
