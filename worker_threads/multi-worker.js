const { parentPort, workerData, threadId } = require('worker_threads');
var process = require('process');


let counter = 0;
for (let i = 0; i < 20_000_000_000 / workerData.thread_count; i++) {
    counter++;
}
console.log('process.pid :>> ', process.pid);
console.log('threadId :>> ', threadId);
parentPort.postMessage(counter)