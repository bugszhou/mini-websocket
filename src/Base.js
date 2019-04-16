/**
 * miniReadyState 0 1 2 3
 * 0 - 请求建立，正在连接，未连通 CONNECTING
 * 1 - 连接建立，可以传输数据 OPEN
 * 2 - 正在关闭 CLOSING
 * 3 - 已关闭或者不能连接 CLOSED
 * 对外提供的事件
 * onOpen
 * onError
 * onMessage
 * onClose
 * onSuccess
 * onFail
 * onComplete
 */
import { EventEmitter } from 'events';
import { merge } from 'lodash';
import evtNames from './utils/evtNames';
import { bind } from './utils/bind';
import { getMiniErrorCode } from './miniCode/index';

class MiniSocketBase extends EventEmitter {
  constructor(url = '', opts = {}) {
    super();
    this.initBaseVar();
    this.miniIns = wx;
    this.mergeOpts(url, opts);
    this.errorCode = getMiniErrorCode(opts.type);
    this.connectSocket(this.options);
    this.setMiniReadyState();
  }

  static readyStateEnum() {
    return {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    };
  }

  initBaseVar() {
    this.miniSocket = null;
    this.options = {};
    this.socketTaskId = -1;
    this.msg = '';
    this.miniReadyState = 0;
  }

  connectSocket(opts = {}) {
    this.miniSocket = this.miniIns.connectSocket(opts);
    return this;
  }

  // send msg
  miniSend({ data = {} } = {}) {
    this
      .miniSocket
      .send({
        data,
        success: () => {
          this.emit(evtNames['Mini:SendSuccess'], null);
        },
        fail: ({ errMsg }) => {
          this.emit(evtNames['Mini:SendFail'], {
            msg: errMsg,
          });
        },
        complete: () => {
          this.emit(evtNames['Mini:SendComplete'], null);
        },
      });
    return this;
  }

  // close cur socket
  miniClose() {
    this.miniSocket.close({
      success: () => {
        this.emit(evtNames['Mini:CloseSuccess'], null);
      },
      fail: ({ errMsg }) => {
        this.emit(evtNames['Mini:CloseFail'], {
          msg: errMsg,
        });
      },
      complete: () => {
        this.emit(evtNames['Mini:CloseComplete'], null);
      },
    });
    return this;
  }

  // close All
  closeSocket() {
    this.miniIns.closeSocket();
    this.initBaseVar();
    return this;
  }

  mergeOpts(url, opts) {
    this.options = merge({
      url,
      header: {},
      protocols: [],
      tcpNoDelay: false,
    }, opts, {
      success: bind(this.success, this),
      fail: bind(this.fail, this),
      complete: bind(this.complete, this),
    });
  }

  initMiniEvt() {
    if (!this.miniSocket) {
      return false;
    }
    this.miniSocket.onOpen(() => {
      if (this.miniSocket) {
        this.setMiniReadyState();
        console.log('Mini:OnOpen', this.options.connectType);
        this.emit(evtNames['Mini:OnOpen'], null, {});
        if (this.options.connectType === 're') {
          this.emit(evtNames['Mini:Reconnect'], null, {
            connectType: this.options.connectType,
          });
        }
      }
    });
    this.miniSocket.onError((err) => {
      if (this.miniSocket) {
        this.setMiniReadyState();
        this.emit(evtNames['Mini:OnError'], err);
      }
    });
    this.miniSocket.onMessage((msg) => {
      if (this.miniSocket) {
        this.setMiniReadyState();
        this.emit(evtNames['Mini:OnMessage'], null, msg);
      }
    });
    this.miniSocket.onClose((closeMsg) => {
      if (this.miniSocket) {
        this.setMiniReadyState();
        this.emit(evtNames['Mini:OnClose'], closeMsg);
      }
    });
    return this;
  }

  success({ socketTaskId, errMsg }) {
    this.socketTaskId = socketTaskId;
    this.msg = errMsg;
    this.emit('Mini:OnSuccess', null, {
      socketTaskId: this.socketTaskId,
      msg: this.msg,
    });
  }

  fail(err) {
    this.emit('Mini:OnFail', {
      msg: err,
    });
  }

  complete({ socketTaskId, errMsg }) {
    if (errMsg.toLowerCase().indexOf('ok') > -1) {
      console.log('MiniSocket Create Success');
    }
    this.emit('Mini:OnComplete', {
      socketTaskId,
      msg: errMsg,
    });
  }

  setMiniReadyState() {
    try {
      const { readyState } = this.miniSocket;
      this.miniReadyState = !readyState && readyState !== 0 ? 3 : readyState;
    } catch (e) {
      console.error(e);
      this.miniReadyState = 3;
    }
    this.emit(evtNames['Mini:OnReadyState'], null, this.miniReadyState);
  }
}

export default MiniSocketBase;
