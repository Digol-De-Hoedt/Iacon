const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('hello world1');
})


app.listen(3005, () => {
    console.log('server is running 3005');
});
