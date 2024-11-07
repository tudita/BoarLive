var http = require('http');
var axios = require('axios');
var Huya = require('./huya');

var huya = new Huya()

http.createServer(async function (request, response) {
    try {
        const headers = {
            'user-agent':
            'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 Edg/117.0.0.0'
        }
        const roomId = '117736'; // 需要定义 roomId
        const result = await huya.getRoomInfo(roomId);
        console.log(result);
        response.end(result.data);
        response.end('Hello World\n');
    } catch (error) {
        console.error(error);
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.end('Internal Server Error\n');
    }
}).listen(8888);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');