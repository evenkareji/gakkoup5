/* app.js */

const fs = require('fs');
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;
const index = fs.readFileSync('./index.html', 'utf-8');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-type': 'text/html',
  });
  res.end(index);
});

const five = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  console.log('Arduino ready!');

  //ボタンの設定
  const button = new five.Button({
    pin: 2,
    isPullup: true,
  });

  //センサーの設定
  let sensor_value = 0;
  const sensor = new five.Sensor({
    pin: 'A0',
    freq: 30,
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);

    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
      console.log(`Connection completed!`);

      //センサーの値を変数に代入
      sensor.on('change', () => {
        sensor_value = sensor.value;
      });

      //ボタンが押されている時の動作
      button.on('hold', function () {
        io.emit('button_value', {
          sensor: sensor_value,
          button: 'hold',
        });
      });

      //ボタンを離した時の動作
      button.on('release', function () {
        io.emit('button_value', {
          sensor: sensor_value,
          button: 'release',
        });
      });
    });
  });
});
