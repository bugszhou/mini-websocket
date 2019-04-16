# mini-websocket
小程序websocket

### Usage

```
const socket = new MiniSocket('ws://localhost:7070/yt22u');
socket
      .on('message', (err, msg) => {
        console.log(msg);
      })
      .on('close', (err, { type }) => {
        if (type === 'SERVER_CLOSE') {
          console.log(''服务器已关闭'');
        }
        console.log('close ===> ', type);
      })
      .on('notopen', (err, data) => {
        socket.reConnect({ data });
      })
      .on('reconnect', (err, { data }) => {
        this.send(data);
        console.log('reconnect ====> ', data);
      })
      .on('retryTimeout', () => {
        console.log('retryTimeout');
      })
      .on('catch', () => {
        console.log('catch');
      });
```
