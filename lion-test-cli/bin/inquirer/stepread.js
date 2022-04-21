function stepRead(callback) {
    function onkeypress(s) {
        output.write(s); // 输出流写入
        line += s;
        switch (s) {
            case '\r': // 触发了回车键时的逻辑
                input.pause(); // 暂停输入流
                callback(line); // 传递给回调方法
                break;
        }
    }

    const input = process.stdin;
    const output = process.stdout;
    let line = '';

    // 发射出 keypress 事件
    emitKeypressEvents(input);

    // 输入流开始监听 keypress 事件
    input.on('keypress', onkeypress);
    //进入原生模式,在这个模式下，输入回车等按键时都需要自己手动进行处理，否则是不会有响应的
    input.setRawMode(true);
    input.resume();
}

function emitKeypressEvents(stream) {
    // 每次监听到输入流中有数据流入时，触发一次next，从而emit一次keypress事件
    function onData(chunk) {
        g.next(chunk.toString());
    }
    // 启动generate函数，并且先执行一次
    const g = emitKeys(stream);
    g.next();
    // 监听input流的data方法
    stream.on('data', onData);
}

function* emitKeys(stream) {
    while (true) {
        let ch = yield;
        stream.emit('keypress', ch);
    }
}

stepRead(function(s) {
    console.log('answer:' + s);
});
