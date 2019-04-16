/**
 * readyState 0 1 2 3
 * 0 - 请求建立，正在连接，未连通 CONNECTING
 * 1 - 连接建立，可以传输数据 OPEN
 * 2 - 正在关闭 CLOSING
 * 3 - 已关闭或者不能连接 CLOSED
 */
export const wxReadyState = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
};

export function getReadyState(type = 'wx') {
  let readyStateObj = {};
  switch (type) {
    case 'wx':
      readyStateObj = wxReadyState;
      break;
    default:
      readyStateObj = wxReadyState;
  }

  return readyStateObj;
}
