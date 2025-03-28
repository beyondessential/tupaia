import { MESSAGE_ADD, MESSAGE_REMOVE } from './constants';

export const addMessage = (key, message, options) => ({
  type: MESSAGE_ADD,
  key,
  message,
  options,
});

export const removeMessage = key => ({
  type: MESSAGE_REMOVE,
  key,
});
