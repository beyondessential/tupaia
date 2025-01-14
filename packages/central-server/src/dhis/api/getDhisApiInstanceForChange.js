import { getDhisApiInstance } from '../getDhisApiInstance';

export const getDhisApiInstanceForChange = ({ details }) => {
  const { isDataRegional, organisationUnitCode } = details;
  return getDhisApiInstance({ entityCode: organisationUnitCode, isDataRegional });
};
