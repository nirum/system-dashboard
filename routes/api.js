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
        pid: Number,
        name: String,
        memory: Number,
        cpu: Number,
        time: Date
    })
);

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
        totalmem: os.totalmem(),
        freemem: os.freemem(),
        fracmem: os.freemem() / os.totalmem(),
        cpus: os.cpus()
    });
});

// GET process information
router.get('/process', function (req, res) {
    Log.find({}, function (err, data) {
        res.json(data);
    });
});

// GET process information for a specific process name
router.get('/process/:name', function (req, res) {
    Log.find({'name': req.params.name}, function (err, data) {
        res.json(data);
    });
});

module.exports = router;
