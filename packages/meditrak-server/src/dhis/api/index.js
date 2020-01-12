/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

export { getDhisApiInstance, getDhisApiInstanceForChange } from './getDhisApiInstance';
export {
  enrollTrackedEntityInProgram,
  enrollTrackedEntityInProgramIfNotEnrolled,
  getEnrollmentsByTrackedEntityId,
  checkIsTrackedEntityEnrolledToProgram,
} from './enrollments';
