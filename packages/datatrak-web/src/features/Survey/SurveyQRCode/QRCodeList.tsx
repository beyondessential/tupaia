import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { QRCodeItem } from './QRCodeItem';
import { Entity } from '../../../types';

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Description = styled(Typography).attrs({ align: 'center' })`
  text-wrap: balance;
`;

const List = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  list-style: none;
  padding-inline-start: 0;
  margin-top: 1.5rem;
`;

interface QRCodeListProps {
  createdEntities: Entity[];
  variant?: 'panel' | 'modal';
}

export const QRCodeList = ({ createdEntities, variant = 'panel' }: QRCodeListProps) => {
  if (!createdEntities || !createdEntities?.length) return null;

  return (
    <>
      <Title>QR&nbsp;code generated</Title>
      <Description>
        Your survey has successfully generated the below QR&nbsp;code
        {createdEntities.length > 1 ? 's' : ''}. Download it below to print or share with others.
      </Description>

      <List>
        {createdEntities.map(entity => (
          <QRCodeItem key={entity.id} entity={entity} listVariant={variant} />
        ))}
      </List>
    </>
  );
};
