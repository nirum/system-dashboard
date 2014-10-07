var express = require('express')
  , os = require('os')
  , moment = require('moment');

var router = express.Router();

/* GET system information. */
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

module.exports = router;
