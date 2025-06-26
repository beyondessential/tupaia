import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

import { VisuallyHidden } from '@tupaia/ui-components';

import { TextInput } from '../../../components';
import { useIsMobile } from '../../../utils';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 7.5em);
  grid-template-rows: repeat(2, auto);
  column-gap: 1.125rem;
`;

interface LatLongFieldsProps {
  setGeolocation: any;
  geolocation: any;
  name: string;
  invalid: boolean;
  required?: boolean;
}

export const LatLongFields = ({
  setGeolocation,
  geolocation,
  name,
  invalid,
  required,
}: LatLongFieldsProps) => {
  const isMobile = useIsMobile();
  // TODO: Relying placeholder text instead of visible labels inaccessible! Addressing this
  // usability issue was triaged out of scope for practical reasons, but this GUI detail should be
  // revised: https://linear.app/bes/issue/RN-1460/update-gps-question-type#comment-cd961000
  const LabelContentWrapper = isMobile ? VisuallyHidden : React.Fragment;

  const handleChange = (e: ChangeEvent<{}>, field: string) => {
    setGeolocation({
      ...geolocation,
      [field]: Number.parseFloat((e.target as HTMLInputElement).value),
      accuracy: 'N/A',
    });
  };

  return (
    <Wrapper>
      <TextInput
        id={`${name}-latitude`}
        name={`${name}-latitude`}
        value={geolocation?.latitude || ''}
        label={<LabelContentWrapper>Latitude</LabelContentWrapper>}
        onChange={(e: ChangeEvent<{}>) => handleChange(e, 'latitude')}
        textInputProps={{
          placeholder: isMobile ? 'Latitude' : 'e.g. 37.7',
          type: 'number',
          inputProps: {
            min: -90,
            max: 90,
          },
          error: invalid,
          required,
        }}
      />
      <TextInput
        id={`${name}-longitude`}
        name={`${name}-longitude`}
        value={geolocation?.longitude || ''}
        label={<LabelContentWrapper>Longitude</LabelContentWrapper>}
        onChange={(e: ChangeEvent<{}>) => handleChange(e, 'longitude')}
        textInputProps={{
          placeholder: isMobile ? 'Longitude' : 'e.g. −122.4', // True minus sign U+2212
          type: 'number',
          inputProps: {
            min: -180,
            max: 180,
          },
          error: invalid,
          required,
        }}
      />
    </Wrapper>
  );
};
