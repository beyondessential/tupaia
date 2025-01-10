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
import { DialogHeader } from './FullScreenDialog';
import { useProjectEntitiesData } from '../api/queries';
import { I18n, makeEntityLink, useUrlParams, getOptionText, getPlaceIcon } from '../utils';
import * as COLORS from '../constants';

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

  &.open {
    background: white;
  }

  img {
    border-radius: 3px;
    width: 3.75rem;
    height: 3.75rem;
  }

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

const ListItemLink = props => <ListItemText component={RouterLink} {...props} />;

const getEntitiesByCodes = (entities, codes) =>
  entities
    .filter(e => codes.includes(e.code))
    .sort((a, b) => {
      const nameA = a.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });

const ListItemComponent = React.memo(({ entities, entity, onMenuClose, view }) => {
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
      <ListItem className={open && 'open'}>
        {entity.imageUrl ? <img src={entity.imageUrl} alt="place" /> : PlaceIcon}
        <ListItemLink to={makeEntityLink(entity.code, view)} onClick={handleMenuClose}>
          {getOptionText(entity, entities)}
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
              view={view}
            />
          ))}
        </List>
      )}
    </>
  );
});

ListItemComponent.propTypes = {
  entities: PropTypes.array.isRequired,
  view: PropTypes.string,
  onMenuClose: PropTypes.func.isRequired,
  entity: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    imageUrl: PropTypes.string,
    childCodes: PropTypes.array,
  }).isRequired,
};

ListItemComponent.defaultProps = {
  view: 'dashboard',
};

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
  overflow: auto;
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

export const EntityMenu = React.memo(({ buttonText }) => {
  const [open, setOpen] = useState(false);
  const { view } = useUrlParams();
  const { data: entities = [], isSuccess } = useProjectEntitiesData();
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
      <Dialog scroll="paper" fullScreen open={open} onClose={handleClose}>
        <DialogHeader handleClose={handleClose} title={<I18n t="home.allLocations" />} />
        <Body>
          {isSuccess && country && (
            <ContainerList>
              {/* Manually add the country link at the top of the list */}
              <ListItem>
                {getPlaceIcon('country')}
                <ListItemLink to={makeEntityLink(country.code, view)} onClick={handleClose}>
                  {getOptionText(country, entities)}
                </ListItemLink>
              </ListItem>
              {getEntitiesByCodes(entities, country.childCodes).map(e => (
                <ListItemComponent
                  key={e.code}
                  entities={entities}
                  entity={e}
                  onMenuClose={handleClose}
                  view={view}
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
