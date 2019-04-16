export default {
  1000: {
    name: 'APP_CLOSE',
    code: 1005,
    errMsg: 'App Closed',
    tip: 'APP主动关闭socket',
  },
  1005: {
    name: 'SERVER_CLOSE',
    code: 1005,
    errMsg: 'no status rcvd',
    tip: '服务器主动关闭socket',
  },
  1006: {
    name: 'NOT_CONNECT',
    code: 1006,
    errMsg: 'abnormal closure',
    tip: '服务器连接不上/服务器报错',
  },
};
