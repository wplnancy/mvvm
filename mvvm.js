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
}

// 观察对象给对象增加 ObjectDefineProperty
function Observe(data) {
    // 这里写我们的主要的逻辑
    for (let key in data) {
        let val = data[key];
        // 实现循环的递归
        if (typeof val === 'object') {
            observe(val);
        }
        // 把 data 双向通过 Object.defineProperty 的方式定义属性
        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                return val;
            },
            set(newVal) { // 更改值
                if (newVal === val) {
                    return;
                }
                console.log('设置了新的值', newVal);
                val = newVal; // 如果以后再获取的时候将刚才的值设置成新的值
                // 新值也可以具备数据劫持的功能
                observe(newVal)
            }
        });
    }
}


function observe(data) {
    return new Observe(data)
}


/*
vue 的特点
1. vue 不能新增不存在的属性， 应为没有 get 和 set
2.深度响应： 因为每一次赋予一个新对象时会给这个新对象增加数据劫持
*/
