/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { EntityList } from '../../entityMenu';
import { takeScrollControl, releaseScrollControl } from '../actions';
import { CodeGeneratorQuestion } from './CodeGeneratorQuestion';
import { QrCodeScannerScreen } from '../QrCodeScannerScreen';
import {
  fetchEntities,
  getEntityAttributeChecker,
  getEntityBaseFilters,
  getRecentEntities,
} from '../../entityMenu/helpers';
import { View } from 'react-native';
import { Text } from '../../widgets';

const DumbEntityQuestion = props => {
  const [qrCodeValue, setQrCodeValue] = useState(null);

  const onSuccess = e => {
    props.onRowPress({ id: e.data });
    setQrCodeValue(e.data);
  };

  const { config, isOnlyQuestionOnScreen, getEntityNameFromQRCode } = props;
  const shouldGenerateCode = config && config.entity && config.entity.createNew;
  const shouldShowQRCodeScanner = config?.entity?.qrCodeScanner;

  if (qrCodeValue) {
    const entityName = getEntityNameFromQRCode(qrCodeValue);
    return (
      <View style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <Text style={{ fontSize: 20 }}>ID: {entityName}</Text>
      </View>
    );
  }

  if (shouldGenerateCode) {
    return <CodeGeneratorQuestion {...props} />;
  }

  if (shouldShowQRCodeScanner) {
    return <QrCodeScannerScreen onSuccess={onSuccess} />;
  }

  return <EntityList startOpen={isOnlyQuestionOnScreen} {...props} />;
};

DumbEntityQuestion.propTypes = {
  config: PropTypes.object,
  isOnlyQuestionOnScreen: PropTypes.bool.isRequired,
};

DumbEntityQuestion.defaultProps = {
  config: null,
};

const mapStateToProps = (
  state,
  { id: questionId, answer: selectedEntityId, realmDatabase: database },
) => {
  const baseEntityFilters = getEntityBaseFilters(state, database, questionId);
  const recentEntities = getRecentEntities(database, state, baseEntityFilters);
  const getEntityNameFromQRCode = id => {
    const entities = fetchEntities(database, { id });
    return entities[0]?.code;
  };
  const checkEntityAttributes = getEntityAttributeChecker(state, questionId);

  return {
    baseEntityFilters,
    checkEntityAttributes,
    recentEntities,
    selectedEntityId,
    getEntityNameFromQRCode,
  };
};

const mapDispatchToProps = (dispatch, { onChangeAnswer }) => ({
  onRowPress: entity => onChangeAnswer(entity.id),
  onClear: () => onChangeAnswer(null),
  takeScrollControl: () => dispatch(takeScrollControl()),
  releaseScrollControl: () => dispatch(releaseScrollControl()),
});

export const EntityQuestion = connect(mapStateToProps, mapDispatchToProps)(DumbEntityQuestion);
