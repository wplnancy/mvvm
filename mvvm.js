function Zhufeng(options = {}) {
    this.$options = options;
    var data = this._data = this.$options.data;
    observe(data);
    // 此时 this 就代理了 this._data

    for (let key in data) {
        Object.defineProperty(this, key, {
            // 可以通过实例获取到值
            enumerable: true,
            get() {
                return this._data[key]; // this.a = {age: 1}
            },
            set(newVal) {
                this._data[key] = newVal
            }
        })
    }
    new Compile(options.el, this);
}

function Compile(el, vm) {
    // el 表示的替换的范围
    // 移动到文档碎片中
    vm.$el = document.querySelector(el);
    let fragment = document.createDocumentFragment();
    // 将 app 中的内容移入到内存中
    while (child = vm.$el.firstChild) {
        fragment.appendChild(child);
    }

    replace(fragment);

    function replace(fragment) {
        Array.from(fragment.childNodes).forEach(function(node) {
            let text = node.textContent
            let reg = /\{\{ (.*) \}\}/;
            if (node.nodeType === 3 && reg.test(text)) {
                let arr = RegExp.$1.split('.'); // [a, a, a]
                let val = vm;
                arr.forEach(function(k) {
                    val = val[k]
                });
                // 替换的逻辑
                new Watcher(vm, RegExp.$1, function(newVal) {
                    // 函数需要接收一个新的值
                    node.textContent = text.replace(/\{\{(.*)\}\}/, newVal);
                })
                node.textContent = text.replace(/\{\{(.*)\}\}/, val);
            }
            if (node.childNodes) {
                replace(node)
            }
        })
    }
    vm.$el.appendChild(fragment);
}

// 观察对象给对象增加 ObjectDefineProperty
function Observe(data) {
    // 这里写我们的主要的逻辑
    for (let key in data) {
        let val = data[key];
        let dep = new Dep()
        console.log(1);
        console.log(dep);
        // 实现循环的递归
        observe(val);
        // 把 data 双向通过 Object.defineProperty 的方式定义属性
        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                Dep.target && dep.addSub(Dep.target) // [watcher]
                return val;
            },
            set(newVal) { // 更改值
                if (newVal === val) {
                    return;
                }
                console.log('设置了新的值', newVal);
                val = newVal; // 如果以后再获取的时候将刚才的值设置成新的值
                // 新值也可以具备数据劫持的功能
                observe(newVal);
                dep.notify(); // 让所有的watch 的 update 方法执行
            }
        });
    }
}


function observe(data) {
    if (typeof data === 'object') {
      new Observe(data)
    }
}


/*
vue 的特点
1. vue 不能新增不存在的属性， 应为没有 get 和 set
2.深度响应： 因为每一次赋予一个新对象时会给这个新对象增加数据劫持
*/


function Dep() {
    this.subs = [];
}

Dep.prototype.addSub = function(sub) {
    this.subs.push(sub);
}

Dep.prototype.notify = function() {
    this.subs.forEach(sub => sub.update())
}

function Watcher(vm, exp, fn) {
    // 这个类的实例都会有 update方法
    this.fn = fn;
    this.vm = vm;
    this.exp = exp; // 将 watcher 添加到订阅中
    Dep.target = this;
    let val = vm;
    let arr = this.exp.split('.');
    arr.forEach(function(k) {
        val = val[k] // 取到 this.a.a， 会默认调用 get 方法
    });
    Dep.target = null
}

Watcher.prototype.update = function() {
    let arr = this.exp.split('.');
    let val = this.vm;
    arr.forEach(function(k) {
        val = val[k] //this.a.a
    });
    // 更新的时候会执行的方法
    this.fn(val);
}
