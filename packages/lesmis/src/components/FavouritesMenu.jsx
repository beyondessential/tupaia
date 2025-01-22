import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Typography, IconButton, Drawer } from '@material-ui/core';
import { Close, StarBorder } from '@material-ui/icons';
import { FlexStart } from './Layout';

/** =================================
 * Todo: Make Favourites Menu
 * @see https://github.com/beyondessential/tupaia-backlog/issues/2290
 * ================================= */

export const FavoritesButton = styled(IconButton)`
  color: white;
  margin-right: 0.5rem;

  .MuiSvgIcon-root {
    font-size: 2rem;
  }
`;

const GUTTER_WIDTH = '30px';

const List = styled.div`
  width: 30rem;
`;

const Tray = styled(FlexStart)`
  padding: 0.375rem 0 0 0.375rem;
`;

const Headings = styled.div`
  padding: 1rem ${GUTTER_WIDTH} 2rem;
`;

const Heading = styled(Typography)`
  font-weight: normal;
  font-size: 2rem;
  line-height: 140%;
  margin-bottom: 0.5rem;
`;

const StyledCard = styled(Link)`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  color: initial;
  text-decoration: none;
  padding: 1.8rem ${GUTTER_WIDTH};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  border-left: 5px solid transparent;

  &:hover {
    cursor: pointer;
    text-decoration: none;
    border-left-color: ${props => props.theme.palette.primary.main};
  }
`;

const CardMedia = styled.div`
  height: 110px;
  width: 110px;
  background-size: cover;
  border-radius: 3px;
  background-repeat: no-repeat;
  background-image: url('/images/school.png');
  margin-right: 1rem;
`;

const CardContent = styled.div`
  padding-top: 10px;
  padding-bottom: 5px;
`;

const favourites = [
  { title: 'Tonga', url: '/TO' },
  { title: 'Vavau', url: '/TO_Vavau' },
  {
    title: 'Tongatapu',
    url: '/TO_Tongatapu',
  },
  {
    title: 'Niuas',
    url: '/TO_Niuas',
  },
  {
    title: 'Niuafoou',
    url: '/TO_Nfoouhc',
  },
  {
    title: 'Niuas Alele',
    url: '/TO_Niuas_Alele',
  },
  {
    title: 'Mayparkngum Secondary School',
    url: '/MayparkngumSchool',
  },
];

export const FavouritesMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = isOpen => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setOpen(isOpen);
  };

  return (
    <>
      <FavoritesButton onClick={toggleDrawer(true)}>
        <StarBorder />
      </FavoritesButton>
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Tray>
          <IconButton color="inherit" onClick={toggleDrawer(false)}>
            <Close />
          </IconButton>
        </Tray>
        <Headings>
          <Heading variant="h3">Favourite Dashboards</Heading>
          <Typography variant="h6">6 Locations</Typography>
        </Headings>
        <List>
          {favourites.map(({ title, url }) => (
            <StyledCard key={title} onClick={toggleDrawer(false)} to={url}>
              <CardMedia />
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {title}
                </Typography>
                <Typography>Mayparkngum District</Typography>
              </CardContent>
            </StyledCard>
          ))}
        </List>
      </Drawer>
    </>
  );
};
