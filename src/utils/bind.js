export const MODULE_NAME = 'bind';
export function bind(fn, _this) {
  return fn.bind(_this);
}
