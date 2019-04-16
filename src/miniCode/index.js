import wxCode from "./wx";

export const MODULE_NAME = 'MINI_CODE';

export function getMiniErrorCode(type = 'wx') {
  let codes = {};
  switch (type) {
    case 'wx':
      codes = wxCode;
      break;
    default:
      codes = wxCode;
  }

  return codes;
}