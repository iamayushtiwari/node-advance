const express = require('express')
const app = express()
const { Readable } = require('stream')
const PORT = 8001
const status = require('express-status-monitor')
const fs = require('fs')
const { Worker } = require('worker_threads');

app.use(status())

app.get('/', function (req, res) {
    /* this is normal way not memory efficient */

    // fs.readFile("./big.txt", (err, data) => {
    //     res.end(data)
    // })

    // const stream = fs.createReadStream('./big.txt', "utf-8")
    // stream.on('data', (chunk) => res.write(chunk))
    // stream.on('end', () => res.end())

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


/* promises will not work to resolve blocking thread */

function calculateCount() {
    return new Promise((resolve, reject) => {
        let counter = 0;
        for (let i = 0; i < 20_000_000_000; i++) {
            counter++;
        }
        resolve(counter);
    });
}

app.get("/blocking", async (req, res) => {
    try {
        const { promise } = req.query
        var process = require('process');
        let counter = 0;
        if (promise) {
            /* promises will not work to resolve blocking thread */
            counter = await calculateCount();
        } else {

            /* this below code block the main thread */

            for (let i = 0; i < 20_000_000_000; i++) {
                counter++;
            }
        }
        return res.status(200).send(`result is ${counter} with process id: ${process.pid}`);
    } catch (error) {
        console.log("error", error.stack);
        return res.status(200).send("error", error.message)
    }
});

app.get("/non-blocking", (req, res) => {
    var process = require('process');
    res.status(200).send(`This page is non-blocking with process id: ${process.pid}`);
});

app.get('/worker-thread', (req, res) => {
    const worker = new Worker("./worker.js")
    var process = require('process');

    worker.on('message', (data) => {
        res.status(200).send(`result is ${data} parent process id: ${process.pid} thread id : ${worker.threadId}`);
    })

    worker.on('error', (error) => {
        res.status(404).send(`error: ${error}`);
    })
})

app.listen(PORT, () => {
    console.log("server is running on Port:", PORT)
})

/* find cores available in system */
//mac: sysctl -n hw.ncpu
//linux: nproc
