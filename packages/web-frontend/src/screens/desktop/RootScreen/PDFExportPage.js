import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

const Main = styled.div`
  height: 100vh;
  background: white;
`;
const PDFExportPage = () => <Main>123</Main>;

PDFExportPage.propTypes = {};

PDFExportPage.defaultProps = {};

const mapStateToProps = state => {};

export default connect(mapStateToProps)(PDFExportPage);
