import { get } from '../api';

export const getCountries = async () => get('country');
