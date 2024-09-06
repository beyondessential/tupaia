/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { ImageUploadField } from '../../src/components';

export default {
  title: 'Inputs/ImageUploadField',
  component: ImageUploadField,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export const Simple = () => {
  const [profileImage, setProfileImage] = React.useState(null);
  const createBase64Image = fileObject => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsDataURL(fileObject);
    });
  };
  const handleFileChange = async fileObject => {
    const base64 = await createBase64Image(fileObject);
    setProfileImage({ data: base64 });
  };
  const handleFileDelete = () => {
    setProfileImage(null);
  };
  return (
    <Container>
      <ImageUploadField
        name="profileImage"
        imageSrc={profileImage && profileImage.data}
        onChange={handleFileChange}
        onDelete={handleFileDelete}
        avatarInitial="BES"
        label="Your avatar"
      />
    </Container>
  );
};
