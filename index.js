const express = require("express");
const bodyParser = require("body-parser");
const MongoServer = require("./config/db");
require('dotenv').config()
const { loadClient, listEvents, createEvent } = require("./apiClient");
const csvtojson = require("csvtojson");
upload = require("express-fileupload");
// const user = require("./routes/user"); //new addition
// Initiate Mongo Server
MongoServer();
const app = express();

// PORT
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(upload());
app.get("/", (req, res) => {
    res.json({ message: "API Working" });
});
app.post("/file", async (req, res) => {

    let csvData1 = req.files.csvfile1.data.toString('utf8');
    let csvData2 = req.files.csvfile2.data.toString('utf8');

    let csvtojson1 = await csvtojson().fromString(csvData1);
    let csvtojson2 = await csvtojson().fromString(csvData2);

    let newJsonArray1 = [];
    let newJsonArray2 = [];

    csvtojson1.forEach(json1 => {
        let newJson1 = {};
        newJson1.OrderNum = json1.OrderNum;
        newJson1["Profit/loss(%)"] = Number(json1["Transferred Amount"]) - Number(json1["Cost Price"]);
        newJson1["Transferred Amount"] = json1["Transferred Amount"];
        newJson1["Total Marketplace Charges"] = Number(json1["Commission"]) + Number(json1["Payment Gateway"]) + Number(json1["PickPack Fee"])
        newJsonArray1.push(newJson1)
    });

    csvtojson2.forEach(json2 => {
        let newJson2 = {};
        newJson2.OrderNum = json2.OrderNum;
        newJson2["Profit/loss(%)"] = Number(json2["Transferred Amount"]) - Number(json2["Cost Price"]);
        newJson2["Transferred Amount"] = json2["Transferred Amount"];
        newJson2["Total Marketplace Charges"] = Number(json2["Commission"]) + Number(json2["Payment Gateway"]) + Number(json2["PickPack Fee"])
        newJsonArray2.push(newJson2)
    });

    let calculetedresult = newJsonArray1.concat(newJsonArray2)

    return res.status(201).json({ json1: csvtojson1, json2: csvtojson2, newJsonArray2, newJsonArray1, calculetedresult })
});
// calender

loadClient();

// Make a GET request to return a list of events in JSON
app.get("/calender/list", function (req, res) {
    listEvents((events) => res.json(events));
});

// Make a POST request to create a new event in the calendar
app.post("/calender/create", (req, res) => {
    createEvent((event) => {
        res.json(event);
    });
});
// app.use("/user", user);
app.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});