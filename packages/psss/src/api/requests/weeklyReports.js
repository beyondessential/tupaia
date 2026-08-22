import { post, put, remove } from '../api';

export const createNote = data => post('notes', { data });

export const updateNote = data => put('notes', { data });

export const deleteNote = data => remove('notes', { data });
