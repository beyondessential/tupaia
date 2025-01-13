import React, { useState } from 'react';
import { ButtonBase, Dialog } from '@material-ui/core';
import { Media } from './Media';

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
          <img src={imageSrc} alt={title} />
        </Dialog>
      )}
      <Media
        $backgroundImage={imageSrc}
        onClick={() => setIsEnlarged(true)}
        as={ButtonBase}
        title="Expand image"
        aria-label={title}
      />
    </>
  );
};
