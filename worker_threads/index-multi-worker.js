const express = require('express')
const app = express()
const { Readable } = require('stream')
const PORT = 8002
const status = require('express-status-monitor')
const fs = require('fs')
const { Worker, workerData } = require('worker_threads');
const THREAD_COUNT = 4;

// app.use(status())

app.get('/', function (req, res) {

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=streamedData.txt');

    // Create a readable stream from the file
    const fileStream = fs.createReadStream('./big.txt', { encoding: 'utf8' });
    fileStream.pipe(res);

    // Handle errors during streaming
    fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        res.status(500).end('Internal Server Error');
    });

    // Handle the end of the file stream
    fileStream.on('end', () => {
        console.log('File stream ended');
        res.end();
    });

})

function createWorker() {
    var process = require('process');

    return new Promise((resolve, reject) => {
        const worker = new Worker("./multi-worker.js", { workerData: { thread_count: THREAD_COUNT } })

        worker.on('message', (data) => {
            resolve(data)
            // res.status(200).send(`result is ${data}`);
        })

        worker.on('error', (error) => {
            reject(error)
            // res.status(404).send(`error: ${error}`);
        })
    })
}

app.get("/blocking", async (req, res) => {

    const workerPromises = []

    for (let i = 0; i < THREAD_COUNT; i++) {
        workerPromises.push(createWorker())
    }

    const thread_result = await Promise.all(workerPromises)

    let total = 0
    thread_result.forEach(result => {
        total += result
    })

    return res.status(200).send(`result: ${total}`)
    // res.status(200).send(`result is ${counter}`);

});

app.get("/non-blocking", (req, res) => {
    res.status(200).send("This page is non-blocking");
});

app.listen(PORT, () => {
    console.log("server is running on Port:", PORT)
})


// Invoke-RestMethod -Uri http://localhost:8001/blocking -Method Get

// (Measure-Command {Invoke-RestMethod -Uri http://localhost:8001/blocking -Method Get}).TotalMilliseconds
// (Measure-Command {Invoke-RestMethod -Uri http://localhost:8002/blocking -Method Get}).TotalMilliseconds

// spon or fork RND

