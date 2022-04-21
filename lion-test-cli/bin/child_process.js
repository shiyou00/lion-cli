#!/usr/bin/env node

const cp = require("child_process");
let child;

child = cp.exec("ls -al | grep node_modules",(err,stdout,stderr)=>{
    console.log('callback start-------------');
    console.log(err);
    console.log(stdout);
    console.log(stderr);
    console.log('callback end-------------');
})

child.on('error', (err) => {
    console.log('error!', err);
});

child.stdout.on('data', (chunk) => {
    console.log('stdout data', chunk);
});

child.stderr.on('data', (chunk) => {
    console.log('stderr data', chunk);
});

child.stdout.on('close', () => {
    console.log('stdout close');
});

child.stderr.on('close', () => {
    console.log('stderr close');
});

child.on('exit', (exitCode) => {
    console.log('exit!', exitCode);
});

child.on('close', () => {
    console.log('close!');
});