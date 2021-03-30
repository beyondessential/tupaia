/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import MuiIconButton from '@material-ui/core/IconButton';
import MuiButton from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import MuiList from '@material-ui/core/List';
import MuiListItem from '@material-ui/core/ListItem';
import { getPlaceIcon } from './SearchBar/utils';
import { DialogHeader } from './FullScreenDialog';
import { useEntitiesData } from '../api/queries';
import { makeEntityLink } from '../utils';
import * as COLORS from '../constants';

const TextButton = styled(MuiButton)`
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
  letter-spacing: 0;
  color: ${props => props.theme.palette.text.secondary};
  padding: 0.375rem 1.18rem 0.372rem 0.625rem;
`;

const Body = styled.div`
  height: 100%;
`;

const ContainerList = styled(MuiList)`
  padding: 0;
  background: ${COLORS.GREY_F9};

  > li {
    padding-left: 1.875rem;
  }

  > li:first-child {
    border-top: none;
  }
`;

const List = styled(MuiList)`
  background: white;
  padding: 0 0 0 6rem;
`;

const IconButton = styled(MuiIconButton)`
  color: ${props => props.theme.palette.text.tertiary};

  &:hover {
    color: ${props => props.theme.palette.text.secondary};
  }

  svg.MuiSvgIcon-root {
    width: 1.875rem;
    height: 1.875rem;
  }
`;

const ListItem = styled(MuiListItem)`
  display: flex;
  align-items: center;
  padding: 0 1.875rem 0 0;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};

  svg.place-icon {
    width: 3.75rem;
    height: 3.75rem;
  }
`;

const ListItemText = styled(Typography)`
  display: inline-block;
  padding-top: 2.3rem;
  padding-bottom: 2.3rem;
  text-decoration: none;
  flex: 1;
  color: initial;
  font-size: 1.125rem;
  line-height: 1.4;
  margin-left: 1rem;
  transition: color 0.1s ease;

  &:hover {
    color: ${props => props.theme.palette.primary.main};
  }
`;

const ListItemLink = props => <ListItemText button component={RouterLink} {...props} />;

const getEntitiesByCodes = (entities, codes) => entities.filter(e => codes.includes(e.code));

const ListItemComponent = React.memo(({ entities, entity, onMenuClose }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = Array.isArray(entity.childCodes);
  const PlaceIcon = getPlaceIcon(entity.type);

  const handleOpen = event => {
    event.stopPropagation();
    setOpen(openState => openState !== true);
  };

  const handleMenuClose = () => {
    onMenuClose();
  };

  return (
    <>
      <ListItem>
        {PlaceIcon}
        <ListItemLink to={makeEntityLink(entity.code)} onClick={handleMenuClose}>
          {entity.name}
        </ListItemLink>
        {hasChildren && (
          <IconButton onClick={handleOpen}>
            {open ? <RemoveCircleIcon color="primary" /> : <AddCircleIcon />}
          </IconButton>
        )}
      </ListItem>
      {open && (
        <List>
          {getEntitiesByCodes(entities, entity.childCodes).map(e => (
            <ListItemComponent
              key={e.code}
              entities={entities}
              entity={e}
              onMenuClose={onMenuClose}
            />
          ))}
        </List>
      )}
    </>
  );
});

ListItemComponent.propTypes = {
  entities: PropTypes.array.isRequired,
  onMenuClose: PropTypes.func.isRequired,
  entity: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    childCodes: PropTypes.array,
  }).isRequired,
};

export const EntityMenu = React.memo(({ buttonText }) => {
  const [open, setOpen] = useState(false);
  const { data: entities = [], isLoading } = useEntitiesData();
  const country = entities.find(e => e.type === 'country');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <TextButton onClick={handleClickOpen}>{buttonText}</TextButton>
      <Dialog fullScreen open={open} onClose={handleClose}>
        <DialogHeader handleClose={handleClose} title="All Locations" />
        <Body>
          {isLoading ? null : (
            <ContainerList>
              {getEntitiesByCodes(entities, country.childCodes).map(e => (
                <ListItemComponent
                  key={e.code}
                  entities={entities}
                  entity={e}
                  onMenuClose={handleClose}
                />
              ))}
            </ContainerList>
          )}
        </Body>
      </Dialog>
    </>
  );
});

EntityMenu.propTypes = {
  buttonText: PropTypes.string.isRequired,
};
