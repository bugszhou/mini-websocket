/**
 * 事件模型
 * 1. 连接
 * 2. 发送信息
 * 3. 关闭
 */

/**
 * readyState 0 1 2 3
 * 0 - 请求建立，正在连接，未连通 CONNECTING
 * 1 - 连接建立，可以传输数据 OPEN
 * 2 - 正在关闭 CLOSING
 * 3 - 已关闭或者不能连接 CLOSED
 * 对外事件：
 * 创建连接
 * 发送信息
 * 接收信息
 * 重新连接
 * 结束
 * catch
 */

import { merge } from 'lodash';
import Base from "./Base";
import evtNames from './utils/evtNames';
import { bind } from './utils/bind';
import { getReadyState } from './utils/types';

const CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3;

class MiniSocket extends Base {
  constructor(url = '', opts = {}) {
    super(url, opts);
    this.initVar();
    this.initDefaultOpts();
    this.mergeConf(url, opts);
    this.setReadyStateEvt();
    this.initMiniEvt();
    this.initEvt();
  }

  static readyStateEnum() {
    return {
      CONNECTING,
      OPEN,
      CLOSING,
      CLOSED,
    };
  }

  initVar() {
    this.config = {};
    this.readyState = 0;
    this.retryTimes = 0;
  }

  initDefaultOpts() {
    this.config = {
      pingMsg: 'ping',
      pingTimeout: 1500,
      pongMsg: 'pong',
      pongTimeout: 1500,
      connectTimeout: 10000,
      reconnectTimeout: 10000,
      repeatLimit: 3,
    };
  }

  initEvt() {
    this.on(evtNames['Mini:OnMessage'], (err, msg) => {
      if (err) {
        this.emit('catch', this.onerror);
      } else {
        this.emit('message', null, msg);
      }
    });
    this.on(evtNames['Mini:OnClose'], (closeMsg) => {
      this.emit('close', null, {
        type: this.errorCode[closeMsg.code].name,
      });
    });
    this.on(evtNames['Mini:OnError'], this.onerror);
    this.on(evtNames['Mini:OnFail'], this.onerror);
    this.on(evtNames['Mini:CloseFail'], this.onerror);
  }

  mergeConf(url, opts) {
    this.config = merge({
      url,
      retryTimes: 3,
      type: 'wx',
      header: {},
      protocols: [],
      tcpNoDelay: false,
    }, opts, {
      success: bind(this.success, this),
      fail: bind(this.fail, this),
      complete: bind(this.complete, this),
    });
  }

  reConnect({ data = {} } = {}) {
    if (this.retryTimes >= this.config.retryTimes) {
      this.emit('retryTimeout', null, {});
      this.retryTimes = 0;
    } else {
      this.retryTimes += 1;
      this.options.connectType = 're';
      this.once(evtNames['Mini:Reconnect'], () => {
        this.retryTimes = 0;
        this.options.connectType = '';
        this.emit('reconnect', null, data);
      });
      this.connectSocket(this.options);
      this.initMiniEvt();
    }
    return this;
  }

  send({ data = {} } = {}) {
    if (this.readyState !== OPEN) {
      this.emit('notopen', {
        msg: 'Socket NotOpen!',
      }, {
        readyState: this.readyState,
        data,
      });
    } else {
      this
        .miniSend({
          data,
        })
        .on(evtNames['Mini:SendFail'], (err) => {
          this.emit('notopen', err, {
            readyState: this.readyState,
            data,
          });
        });
    }
    return this;
  }

  close() {
    if (this.readyState === CLOSING || this.readyState === CLOSED) {
      this.emit('close', null, {
        type: this.errorCode[1000].name,
      });
    }
    this.miniClose();
    return this;
  }

  setReadyStateEvt() {
    this.on(evtNames['Mini:OnReadyState'], (err, miniReadyState) => {
      if (err) {
        this.emit('catch', err);
        return false;
      }
      this.readyState = getReadyState(this.config.type)[miniReadyState] || 3;
      return true;
    });
  }

  // heartBeat() {
  // TODO: 发一次ping的检测
  // 超过1.5秒未回复，则重新发送ping，发送3次后未ping通，则触发重连
  // }

  onerror(err) {
    this.emit('catch', err);
    this.clear();
  }

  clear() {
    this.initVar();
    this.initBaseVar();
  }
}

export const MODULE_NAME = 'MiniSocket';
export { MiniSocket };
