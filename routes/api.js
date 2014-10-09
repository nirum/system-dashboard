var express = require('express')
  , router = express.Router()
  , mongoose = require('mongoose')
  , os = require('os')
  , moment = require('moment');

// connect to database
var dbUrl = 'mongodb://localhost/usage';
mongoose.connect(dbUrl);
var db = mongoose.connection;
db.on('error', function() {
    throw new Error('Unable to connect to database at ' + dbUrl);
});

// set up Model schema
var Log = mongoose.model('Log', new mongoose.Schema({
    pid: String,
    name: String,
    memory: Number,
    cpu: Number,
    time: Date
}));
var Active = mongoose.model('Active', new mongoose.Schema({
    ipython: [Number],
    matlab: [Number]
}));

// GET system information
router.get('/system', function(req, res) {
    res.json({
        hostname: os.hostname(),
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        uptime: moment.unix(moment().unix() - os.uptime()).fromNow(),
        loadavg: os.loadavg(),
        cpus: os.cpus()
    });
});

// GET system memory
router.get('/system/memory', function (req, res) {
    res.json({
        totalmem: os.totalmem(),
        freemem: os.freemem(),
        fracmem: 1 - os.freemem() / os.totalmem()
    });
});

// GET process information
router.get('/process', function (req, res) {
    Active.findOne({}, function (err, data) {
        res.json(data);
    });
});

// GET process information for a specific process name
router.get('/process/:id', function (req, res) {
    Log.find({"pid":req.params.id}, function (err, data) {
        res.json(data);
    });
});

module.exports = router;
