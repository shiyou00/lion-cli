const EventEmitter = require('events');
const readline = require('readline');
const MuteStream = require('mute-stream');
const { fromEvent } = require('rxjs');
const ansiEscapes = require('ansi-escapes');

const option = {
    type: 'list',
    name: 'name',
    message: 'select your name:',
    choices: [{
        name: 'sam', value: 'sam',
    }, {
        name: 'shuangyue', value: 'sy',
    }, {
        name: 'zhangxuan', value: 'zx',
    }],
};

class List extends EventEmitter{
    constructor() {
        super();
        // 获取option
        this.name = option.name;
        this.message = option.message;
        this.choices = option.choices;
        // 创建输入流以及输出流
        this.input = process.stdin;
        const ms = new MuteStream(); // 对输出流进行控制
        ms.pipe(process.stdout);
        this.output = ms;
        // 创建readline实例，用来监听事件
        this.rl = readline.createInterface({
            input: this.input,
            output: this.output,
        });
        this.selected = 0; // 默认选中的元素
        this.height = 0; // 整个列表的高度，默认是0
        // 监听keypress事件
        this.keypress = fromEvent(this.rl.input, 'keypress')
            .forEach(this.onkeypress);
        this.haveSelected = false; // 是否已经选择完毕
    }

    onkeypress = (keymap) => {
        const key = keymap[1];
        if (key.name === 'down') {
            this.selected++;
            if (this.selected > this.choices.length - 1) {
                this.selected = 0;
            }
            this.render();
        } else if (key.name === 'up') {
            this.selected--;
            if (this.selected < 0) {
                this.selected = this.choices.length - 1;
            }
            this.render();
        } else if (key.name === 'return') {
            this.haveSelected = true;
            this.render();
            this.close();
            this.emit('exit', this.choices[this.selected]);
        }
    };

    render(){
        this.output.unmute(); // 解除对output的禁用
        this.clean(); // 清空
        this.output.write(this.getContent()); // 写入列表
        this.output.mute(); // 禁用output
    }
    // 根据choices内容渲染列表
    getContent = () => {
        if (!this.haveSelected) {
            let title = '\x1B[32m?\x1B[39m \x1B[1m' + this.message + '\x1B[22m\x1B[0m \x1B[0m\x1B[2m(Use arrow keys)\x1B[22m\n';
            this.choices.forEach((choice, index) => {
                if (index === this.selected) {
                    // 判断是否为最后一个元素，如果是，则不加\n
                    if (index === this.choices.length - 1) {
                        title += '\x1B[36m❯ ' + choice.name + '\x1B[39m ';
                    } else {
                        title += '\x1B[36m❯ ' + choice.name + '\x1B[39m \n';
                    }
                } else {
                    if (index === this.choices.length - 1) {
                        title += '  ' + choice.name;
                    } else {
                        title += '  ' + choice.name + '\n';
                    }
                }
            });
            this.height = this.choices.length + 1;
            return title;
        } else {
            // 输入结束后的逻辑
            const name = this.choices[this.selected].name;
            let title = '\x1B[32m?\x1B[39m \x1B[1m' + this.message + '\x1B[22m\x1B[0m \x1B[36m' + name + '\x1B[39m\x1B[0m \n';
            return title;
        }
    };
    // 清空屏幕
    clean() {
        const emptyLines = ansiEscapes.eraseLines(this.height);
        this.output.write(emptyLines);
    }

    close() {
        // 输出流解除控制
        this.output.unmute();
        // 关闭readline流
        this.rl.output.end();
        this.rl.pause();
        this.rl.close();
    }
}

function Prompt(option){
    return new Promise((resolve, reject)=>{
        try{
            const list = new List(option);
            list.render();
            list.on('exit', function(answers) {
                resolve(answers);
            })
        }catch (e) {
            reject(e);
        }
    })
}

Prompt(option).then(answers => {
    console.log('answers:', answers);
});