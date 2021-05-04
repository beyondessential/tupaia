/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useTheme } from '@material-ui/core/styles';
import MuiDialog from '@material-ui/core/Dialog';
import { DialogHeader } from './FullScreenDialog';
import * as COLORS from '../constants';
import { FlexSpaceBetween } from './Layout';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Wrapper = styled.div`
  height: 100%;
  overflow: auto;
  background: ${COLORS.GREY_F9};
`;

const Container = styled.div`
  max-width: 1130px;
  padding: 20px 100px 0;
`;

const Header = styled(FlexSpaceBetween)`
  min-height: 90px;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Body = styled.div`
  height: 100%;
  padding: 30px 0 0;
  overflow: auto;
  background: ${COLORS.GREY_F9};
`;

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 20px;
  line-height: 23px;
`;

export const DashboardReportModal = ({ buttonText, children }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleClickOpen} endIcon={<ArrowRightIcon />} color="primary">
        {buttonText}
      </Button>
      <MuiDialog
        scroll="paper"
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        style={{ left: fullScreen ? '0' : '100px' }}
      >
        <DialogHeader handleClose={handleClose} title="Textbooks & teacher guides" />
        <Wrapper>
          <Container>
            <Header>
              <Heading>Textbook Shortage: by Grade and Subject</Heading>
            </Header>
            <Body>{children}</Body>
          </Container>
        </Wrapper>
      </MuiDialog>
    </>
  );
};

DashboardReportModal.propTypes = {
  buttonText: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
