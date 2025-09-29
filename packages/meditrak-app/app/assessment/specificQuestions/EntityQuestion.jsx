import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { EntityList } from '../../entityMenu';
import {
  fetchEntities,
  getEntityAttributeChecker,
  getEntityBaseFilters,
  getRecentEntities,
} from '../../entityMenu/helpers';
import { Divider } from '../../widgets';
import { releaseScrollControl, takeScrollControl } from '../actions';
import { QrCodeScanner } from '../QrCodeScanner';
import { CodeGeneratorQuestion } from './CodeGeneratorQuestion';

const DumbEntityQuestion = props => {
  const {
    config,
    isOnlyQuestionOnScreen,
    onClear,
    onSelectEntity,
    selectedEntityId,
    validEntities,
  } = props;
  const [isScanningQrCode, setIsScanningQrCode] = useState(false);

  const onQrCodeRead = qrCodeData => {
    let entityId;
    try {
      [, entityId] = qrCodeData.split('entity-');
    } catch {
      throw new Error('Invalid QR Code: Cannot parse entity id');
    }

    if (!validEntities.find(({ id }) => id === entityId)) {
      throw new Error('Invalid QR Code: does not match a valid entity for this question');
    }
    onSelectEntity({ id: entityId });
  };

  const shouldGenerateCode = config?.entity?.createNew;
  const shouldShowQrCodeScanner = !selectedEntityId && config?.entity?.allowScanQrCode;

  if (shouldGenerateCode) {
    return <CodeGeneratorQuestion {...props} />;
  }

  // RN-984 if selected entity is not in the list, clear the selected entity
  if (selectedEntityId) {
    const selectedEntity = validEntities.find(entity => entity.id === selectedEntityId);
    if (!selectedEntity) {
      onClear();
      return null;
    }
  }

  const entityListSelector = (
    <EntityList startOpen={isOnlyQuestionOnScreen} onRowPress={onSelectEntity} {...props} />
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
        {isScanningQrCode ? null : entityListSelector}
      </>
    );
  }

  return entityListSelector;
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
