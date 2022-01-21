require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover-info', async (req, res) => {
    // Find out the date of the latest photo sequence taken by each rover
    // Then, for each rover, fetch photos from the last updated date
    // Query format is: "{rovers: <array of rover names>}"
    // Returns an array of photos

    const rovers = req.query.rovers.toLowerCase().split(',');
    const today = new Date().toISOString().split('T')[0];
    let dateInfo = {};
    let roverInfo = {
        lastQueryDay: today,
    };
    rovers.forEach(rover => {
        roverInfo = {
            ...roverInfo,
            [rover]: {
                manifest: {},
                photos: [],
            },
        };
    })

    try {
        await Promise.all(rovers.map(async (rover) => {
            await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`)
                .then(res => res.json())
                .then((res) => {
                    dateInfo[rover] = res.photo_manifest.max_date;
                    roverInfo[rover].manifest = res.photo_manifest;
                })
        }));
    } catch (err) {
        console.log('Error when fetching last updated dates:', err);
    }

    try {
        await Promise.all(rovers.map(async (rover) => {
            await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${dateInfo[rover]}&api_key=${process.env.API_KEY}`)
                .then(res => res.json())
                .then(({photos}) => {
                    roverInfo[rover].photos = photos;
                });
        }));
    } catch (err) {
        console.log('Error when fetching rover photos:', err);
    }

    try {
        res.send(roverInfo)
    } catch (err) {
        console.log('Error when returning rover photos:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
