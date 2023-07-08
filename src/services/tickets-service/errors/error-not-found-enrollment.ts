import { ApplicationError } from '@/protocols';

export function notFoundEnrolment(): ApplicationError {
  return {
    name: 'NotFoundEnrolment',
    message: 'User without enrollment.',
  };
}
