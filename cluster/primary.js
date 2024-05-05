const cluster = require("cluster")
const os = require("os")
const { dirname } = require("path")
const { fileURLToPath } = require("url")




// const _dirname = dirname(fileURLToPath())

const cpuCount = os.cpus().length

console.log(`Total number of CPUs is ${cpuCount}`);
console.log(`Primary pid>>> ${process.pid}`);

cluster.setupPrimary({
    exec: "./index.js"
})

for (let i = 0; i < cpuCount; i++) cluster.fork()

cluster.on("exit", (worker, code, signal) => {
    console.log(`worker >>> ${process.pid} has been killed`);
    console.log("Starting another worker");
    cluster.fork()
})