const { parentPort, threadId } = require('worker_threads');
var process = require('process');


let counter = 0;
for (let i = 0; i < 20_000_000_000; i++) {
    counter++;
}

parentPort.postMessage(`${counter} child process id: ${process.pid} thread id: ${threadId}`)