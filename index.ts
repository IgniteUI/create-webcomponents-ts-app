#!/usr/bin/env node
import yargs = require('yargs');
import path = require('path');
import fs = require('fs');
import child_process = require('child_process');

const argv = yargs.option("support-ie", { type: "boolean" }).argv;
let valid = true;

if (argv._.length < 1) {
    console.log("must specify a project name");
    valid = false;
}

let projectName = "";
if (valid) {
    projectName = argv._[0];
    if (!(/^[\sa-zA-Z][\w\s\-]*$/.test(projectName))) {
        console.error("project name must be alpha numeric characters and dashes.");
        valid = false;   
    }
}

let targetDir = "";
if (valid) {
    targetDir = path.join(process.cwd(), projectName);
    if (fs.existsSync(targetDir)) {
        console.error("directory already exists: " + targetDir.toString());
        valid = false; 
    }
}

var fromDir = path.join(__dirname, "template");

function cloneTemplate(relPath: string) {
    var currFromDir = path.join(fromDir, relPath);
    let files = fs.readdirSync(currFromDir);

    var toDir = path.join(targetDir, relPath)
    if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir);
    }
    
    files.forEach((file, index) => {
        let fromFile = path.join(currFromDir, file);

        let stats = fs.statSync(fromFile);
        if (stats.isDirectory()) {
            cloneTemplate(path.join(relPath, file));
        } else {
            let currFile = fs.readFileSync(fromFile);
            let fileContent = currFile.toString();
            
            let toFile = path.join(toDir, file);
            fileContent = fileContent.replace(/@@AppName/gm, projectName);
            fs.writeFileSync(toFile, fileContent);
        }
    });
};

if (valid) {
    fs.mkdirSync(targetDir);

    cloneTemplate("");

    process.chdir(targetDir);
    child_process.execSync('npm install');
}