var express = require('express');
var router = express.Router();

var sys = require("util");
var exec = require("child_process").exec;

var deviceip;

router.get('/', function(req, res, next) {
    res.render('index', { title: 'FireTV Remote' });
});

router.get('/remote-control', function(req, res, next) {
    res.render('remote-control');
});

function puts(error,stdout,stderr) {
    if (error) {
        console.error(error);
    }
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
}

function sendKeyPress ( keyCode, keyName, longpress ) {
    if (!deviceip) {
        throw new Error("missing device ip!");
    }
    const longpressOpt = longpress? "--longpress" : "";
    const cmd = `${adbPath()} -s ${deviceip} shell input keyevent ${longpressOpt} ${keyCode}`;
    exec(cmd, puts);
    return `${keyName} (${keyCode}) pressed.`;
}

function adbPath (  ) {
    return "/usr/bin/adb";
}

router.post('/', function(req, res, next) {
    if (req.body.deviceip != null) {
        console.log("Connecting...");
        deviceip = req.body.deviceip;
        exec(adbPath() + " connect " + deviceip, puts);
        res.send("Successfully connected.");
    } else if (req.body.disconnect) {
        console.log("Disconnecting...");
        exec(adbPath() + " disconnect", puts);
        res.send("Successfully disconnected.");
    } else if (req.body.keypadID != null) {
        var kpd = req.body.keypadID;
        var msg;
        if (kpd == "up") {
            msg = sendKeyPress(19, "Up arrow");
        } else if (kpd == "down") {
            msg = sendKeyPress(20, "Down arrow");
        } else if (kpd == "left") {
            msg = sendKeyPress(21, "Left arrow");
        } else if (kpd == "right") {
            msg = sendKeyPress(22, "Right arrow");
        } else if (kpd == "select") {
            msg = sendKeyPress(23, "Select button");
        } else if (kpd == "back") {
            msg = sendKeyPress(22, "Back button");
        } else if (kpd == "home") {
            msg = sendKeyPress(3, "Home button");
        } else if (kpd == "menu") {
            msg = sendKeyPress(1, "Menu button");
        } else if (kpd == "last") {
            msg = sendKeyPress(21, "Last button");
        } else if (kpd == "playtoggle") {
            msg = sendKeyPress(66, "Play button");
        } else if (kpd == "next") {
            msg = sendKeyPress(22, "Right button");
        } else {
            msg = sendKeyPress(kpd, kpd);
        }
        res.send(msg);
    } else if (req.body.rawcommand != null) {
        exec(adbPath() + " shell " + req.body.rawcommand, puts);
        res.send("Custom command sent.");
    }
});

module.exports = router;
