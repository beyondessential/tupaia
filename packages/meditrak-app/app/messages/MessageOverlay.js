import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { MessageExplode, MessageBanner } from './types';
import { removeMessage, MESSAGE_TYPES } from '.';

const renderMessage = (messageKey, messageObject, onRemoveMessage) => {
  const { message, options } = messageObject;
  if (!message) {
    return null;
  }

  switch (options.type) {
    case MESSAGE_TYPES.EXPLODE:
      return (
        <MessageExplode
          key={messageKey}
          message={message}
          onDismiss={onRemoveMessage}
          messageOptions={options}
        />
      );

    default:
    case MESSAGE_TYPES.BANNER:
      return <MessageBanner key={messageKey} message={message} onDismiss={onRemoveMessage} />;
  }
};

const MessageOverlayComponent = ({ items, onRemoveMessage }) => (
  <View style={localStyles.wrapper} pointerEvents="box-none">
    {Object.keys(items).map(messageKey =>
      renderMessage(messageKey, items[messageKey], () => onRemoveMessage(messageKey)),
    )}
  </View>
);

MessageOverlayComponent.propTypes = {
  items: PropTypes.object,
  onRemoveMessage: PropTypes.func,
};

const localStyles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
  },
});

const mapStateToProps = ({ messages }) => ({
  items: messages.items,
});

const mapDispatchToProps = dispatch => ({
  onRemoveMessage: messageKey => dispatch(removeMessage(messageKey)),
});

export const MessageOverlay = connect(mapStateToProps, mapDispatchToProps)(MessageOverlayComponent);
