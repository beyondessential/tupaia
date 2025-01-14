import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { EntityList } from '../../entityMenu';
import { takeScrollControl, releaseScrollControl } from '../actions';
import { CodeGeneratorQuestion } from './CodeGeneratorQuestion';
import { QrCodeScanner } from '../QrCodeScanner';
import {
  fetchEntities,
  getEntityAttributeChecker,
  getEntityBaseFilters,
  getRecentEntities,
} from '../../entityMenu/helpers';
import { Divider } from '../../widgets';

const DumbEntityQuestion = props => {
  const [isScanningQrCode, setIsScanningQrCode] = useState(false);

  const onQrCodeRead = qrCodeData => {
    let entityId;
    try {
      [, entityId] = qrCodeData.split('entity-');
    } catch {
      throw new Error('Invalid QR Code: Cannot parse entity id');
    }

    if (!props.validEntities.find(({ id }) => id === entityId)) {
      throw new Error('Invalid QR Code: does not match a valid entity for this question');
    }
    props.onSelectEntity({ id: entityId });
  };

  const { config, isOnlyQuestionOnScreen } = props;
  const shouldGenerateCode = config?.entity?.createNew;
  const shouldShowQrCodeScanner = !props.selectedEntityId && config?.entity?.allowScanQrCode;

  if (shouldGenerateCode) {
    return <CodeGeneratorQuestion {...props} />;
  }

  // RN-984 if selected entity is not in the list, clear the selected entity
  const { selectedEntityId, validEntities } = props;
  if (selectedEntityId) {
    const selectedEntity = validEntities.find(entity => entity.id === selectedEntityId);
    if (!selectedEntity) {
      props.onClear();
      return null;
    }
  }

  const EntityListSelector = (
    <EntityList startOpen={isOnlyQuestionOnScreen} onRowPress={props.onSelectEntity} {...props} />
  );

  if (shouldShowQrCodeScanner) {
    return (
      <>
        <QrCodeScanner
          onRead={onQrCodeRead}
          onStartScan={() => setIsScanningQrCode(true)}
          onFinishScan={() => setIsScanningQrCode(false)}
        />
        {isScanningQrCode ? null : <Divider text="or" />}
        {isScanningQrCode ? null : EntityListSelector}
      </>
    );
  }

  return EntityListSelector;
};

DumbEntityQuestion.propTypes = {
  config: PropTypes.object,
  isOnlyQuestionOnScreen: PropTypes.bool.isRequired,
  onSelectEntity: PropTypes.func.isRequired,
  validEntities: PropTypes.array.isRequired,
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
  const validEntities = fetchEntities(database, baseEntityFilters, checkEntityAttributes);

  return {
    recentEntities,
    selectedEntityId,
    validEntities,
  };
};

const mapDispatchToProps = (dispatch, { onChangeAnswer }) => ({
  onSelectEntity: entity => onChangeAnswer(entity.id),
  onClear: () => onChangeAnswer(null),
  takeScrollControl: () => dispatch(takeScrollControl()),
  releaseScrollControl: () => dispatch(releaseScrollControl()),
});

export const EntityQuestion = connect(mapStateToProps, mapDispatchToProps)(DumbEntityQuestion);
