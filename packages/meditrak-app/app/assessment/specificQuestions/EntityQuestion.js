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
import { QrCodeScanner } from '../QrCodeScanner';
import {
  getEntityAttributeChecker,
  getEntityBaseFilters,
  getRecentEntities,
} from '../../entityMenu/helpers';
import { Divider } from '../../widgets';

const DumbEntityQuestion = props => {
  const [isScanningQRCode, setIsScanningQRCode] = useState(false);

  const onQRCodeRead = ({ data }) => {
    props.onSelectEntity({ id: data });
  };

  const { config, isOnlyQuestionOnScreen } = props;
  const shouldGenerateCode = config?.entity?.createNew;
  const shouldShowQRCodeScanner = !props.selectedEntityId && config?.entity?.showQrCode;

  if (shouldGenerateCode) {
    return <CodeGeneratorQuestion {...props} />;
  }

  const EntityListSelector = (
    <EntityList startOpen={isOnlyQuestionOnScreen} onRowPress={props.onSelectEntity} {...props} />
  );

  if (shouldShowQRCodeScanner) {
    return (
      <>
        <QrCodeScanner
          onRead={onQRCodeRead}
          onStartScan={() => setIsScanningQRCode(true)}
          onFinishScan={() => setIsScanningQRCode(false)}
        />
        {isScanningQRCode ? null : <Divider text="or" />}
        {isScanningQRCode ? null : EntityListSelector}
      </>
    );
  }

  return EntityListSelector;
};

DumbEntityQuestion.propTypes = {
  config: PropTypes.object,
  isOnlyQuestionOnScreen: PropTypes.bool.isRequired,
  onSelectEntity: PropTypes.func.isRequired,
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
  const checkEntityAttributes = getEntityAttributeChecker(state, questionId);

  return {
    baseEntityFilters,
    checkEntityAttributes,
    recentEntities,
    selectedEntityId,
  };
};

const mapDispatchToProps = (dispatch, { onChangeAnswer }) => ({
  onSelectEntity: entity => onChangeAnswer(entity.id),
  onClear: () => onChangeAnswer(null),
  takeScrollControl: () => dispatch(takeScrollControl()),
  releaseScrollControl: () => dispatch(releaseScrollControl()),
});

export const EntityQuestion = connect(mapStateToProps, mapDispatchToProps)(DumbEntityQuestion);
