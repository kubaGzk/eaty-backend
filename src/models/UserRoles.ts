import { AccessControl } from 'accesscontrol';

const ac = new AccessControl();

ac.grant('ADMIN')
  .createAny('ORDER')
  .createAny('CATEGORY')
  .createAny('ITEM')
  .createAny('COMPOSITION')
  .createAny('REPORT')
  .createAny('USER')
  .readAny('ORDER')
  .readAny('CATEGORY')
  .readAny('ITEM')
  .readAny('COMPOSITION')
  .readAny('REPORT')
  .readAny('USER')
  .deleteAny('ORDER')
  .deleteAny('CATEGORY')
  .deleteAny('ITEM')
  .deleteAny('COMPOSITION')
  .deleteAny('REPORT')
  .updateAny('ORDER')
  .updateAny('CATEGORY')
  .updateAny('ITEM')
  .updateAny('COMPOSITION');

ac.grant('PICKER')
  .readAny('ORDER')
  .readAny('CATEGORY')
  .readAny('ITEM')
  .readAny('COMPOSITION')
  .updateAny('ORDER');

ac.grant('REPORT')
  .readAny('ORDER')
  .readAny('CATEGORY')
  .readAny('ITEM')
  .readAny('COMPOSITION')
  .readAny('REPORT')
  .createAny('REPORT')
  .updateAny('REPORT')
  .deleteAny('REPORT');

ac.grant('DRIVER')
  .readAny('ORDER')
  .readAny('CATEGORY')
  .readAny('ITEM')
  .readAny('COMPOSITION')
  .updateAny('ORDER');

export default ac;
