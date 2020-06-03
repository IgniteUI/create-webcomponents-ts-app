#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var path = require("path");
var fs = require("fs");
var child_process = require("child_process");
var argv = yargs.option("support-ie", { type: "boolean" }).argv;
var valid = true;
if (argv._.length < 1) {
    console.log("must specify a project name");
    valid = false;
}
var projectName = "";
if (valid) {
    projectName = argv._[0];
    if (!(/^[\sa-zA-Z][\w\s\-]*$/.test(projectName))) {
        console.error("project name must be alpha numeric characters and dashes.");
        valid = false;
    }
}
var targetDir = "";
if (valid) {
    targetDir = path.join(process.cwd(), projectName);
    if (fs.existsSync(targetDir)) {
        console.error("directory already exists: " + targetDir.toString());
        valid = false;
    }
}
var fromDir = path.join(__dirname, "template");
function cloneTemplate(relPath) {
    var currFromDir = path.join(fromDir, relPath);
    var files = fs.readdirSync(currFromDir);
    var toDir = path.join(targetDir, relPath);
    if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir);
    }
    files.forEach(function (file, index) {
        var fromFile = path.join(currFromDir, file);
        var stats = fs.statSync(fromFile);
        if (stats.isDirectory()) {
            cloneTemplate(path.join(relPath, file));
        }
        else {
            var currFile = fs.readFileSync(fromFile);
            var fileContent = currFile.toString();
            var toFile = path.join(toDir, file);
            fileContent = fileContent.replace(/@@AppName/gm, projectName);
            fs.writeFileSync(toFile, fileContent);
        }
    });
}
;
if (valid) {
    fs.mkdirSync(targetDir);
    cloneTemplate("");
    process.chdir(targetDir);
    child_process.execSync('npm install');
}
