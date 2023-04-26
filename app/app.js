const express = require("express");
const app = express();
const db = require("./connect.js")

app.use(express.static(__dirname + "/public"));

app.listen(3000, function () {
    console.log("Сервер очікує підключення...");
});

app.get("/api/path/jsonstring", async function (req, res) {
    try {
        const geojsonString = await db.getGeoPathJsonString();
        res.send(geojsonString);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get("/api/center/jsonstring", async function (req, res) {
    try {
        const geojsonString = await db.getGeoCenterJSONString();
        res.send(geojsonString);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get("/api/map/jsonstring", async function (req, res) {
    try {
        const geojsonString = await db.getGeoMapJSONString();
        res.send(geojsonString);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get("/api/cells/jsonstring", async function (req, res) {
    try {
        const geojsonString = await db.getGeoCellsJSONString();
        res.send(geojsonString);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.put("/api/findpath/:array", async function (req, res) {
    try {
        const array = req.params.array.split(',').map(item => parseInt(item));
        var success = await db.findPath(array);
        res.send(success);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.put("/api/findcells/:region/:cellSize", async function (req, res) {
    try {
        const region = req.params.region;
        const cellSize = req.params.cellSize;
        var success = await db.findCells(region, cellSize);
        res.send(success);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get("/api/findpath/distance", async function (req, res) {
    try {
        var distance = await db.getPathDistance();
        res.send({distance: distance});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

