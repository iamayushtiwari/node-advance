const express = require("express")
const app = express()
const PORT = 3001

app.get('/heavy', (req, res) => {
    let total = 0
    while (total < 50_000_000_00) ++total

    return res.send(`result of CPU intensive Task is >> ${total}\n`)
})

app.get('/', (req, res) => {
    return res.send("ok")
})
app.listen(PORT, () => {
    console.log('server is up on port :>> ', PORT, `>> http://localhost:${PORT}`);
    console.log(`worker pid>>> ${process.pid}`);

})
// load test for node server
// npx loadtest -n 1200 -c 400 http://localhost:3001/heavy