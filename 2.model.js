// 发布订阅模式  先有订阅 ， 在有发布


// 绑定的方法都有一个 update 属性
function Dep() {
    this.subs = [];
}

Dep.prototype.addSub = function(sub) {
    this.subs.push(sub);
}

Dep.prototype.notify = function() {
    this.subs.forEach(sub => sub.update())
}


function Watcher(fn) {
    // 这个类的实例都会有 update方法
    this.fn = fn;
}


Watcher.prototype.update = function() {
    this.fn();
}

let watcher = new Watcher(function() {
    // 监听函数
    console.log(1);
})

let dep = new Dep();
dep.addSub(watcher); // 将 watcher 放到了数组中 【watch,update】
dep.addSub(watcher);

console.log(dep.subs);
dep.notify();// 数组关系
