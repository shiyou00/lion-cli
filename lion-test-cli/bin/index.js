#!/usr/bin/env node

const lib = require("../lib");
const argv = require('process').argv;

// 注册一个命令 lion-test-cli init --name vue-test-app
const command = argv[2]; // init
const options = argv.slice(3); // 目前只考虑支持一个options的情况 [--name,vue-test-app]

if(options.length > 1){
    let [option,param] = options;
    option = option.replace("--","");
    
    if(command){
        if(lib[command]){
            lib[command]({option,param});
        }else{
            console.log("命令不存在");
        }
    }else{
        console.log("请输入命令");
    }
}

// 全局命令 --version
if(command.startsWith("--") || command.startsWith("-")){
    const globalOption = command.replace(/--|-/g,'');
    if(["version","V"].includes(globalOption)){
        console.log("version:1.0.0")
    }
}