import { ButtonBase, Dialog } from '@material-ui/core';
import React, { useState } from 'react';
import { Image } from './Image';

/**
 * @privateRemarks .png → .jpg accounts for legacy behaviour (v2026-10 and earlier) where S3Client
 * did no conversion before uploading to S3. CreateThumbnail Lambda converted only PNGs to JPEG.
 * Since v2026-16, S3Client converts all but SVG to WebP before uploading to S3. CreateThumbnail
 * resizes and keeps .webp extension.
 *
 * Summary of CreateThumbnail behaviours
 * | Version    | Input image               | Output thumbnail           |
 * | ---------- | ------------------------- | -------------------------- |
 * | ≤ v2026-10 | (.jpeg, .jpg, .png, .svg) | (.jpeg, .jpg, .jpg, Error) |
 * | ≥ v2026-16 | (.svg, .webp)             | (.svg, .webp)              |
 */
const getOrgUnitPhotoUrl = (photoUrl?: string) => {
  if (!photoUrl) return undefined;
  if (photoUrl.endsWith('.svg')) return photoUrl; // CreateThumbnail Lambda skips SVGs

  const dir = photoUrl.includes('dev_uploads') ? 'dev_uploads' : 'uploads';

  return photoUrl.replace(`/${dir}/`, `/thumbnails/${dir}/`).replace(/\.png$/, '.jpg');
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
        <Dialog open={isEnlarged} onClose={() => setIsEnlarged(false)} fullWidth>
          <img
            alt={title}
            crossOrigin=""
            src={photoUrl}
            style={{
              blockSize: '100%',
              inlineSize: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
            }}
          />
        </Dialog>
      )}
      <ButtonBase
        aria-label="Expand image"
        onClick={() => setIsEnlarged(true)}
        title="Expand image"
        style={{ inlineSize: '100%' }}
      >
        <Image alt={title} src={thumbUrl} />
      </ButtonBase>
    </>
  );
};
