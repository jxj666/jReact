let childrenSymbol = Symbol("children");

// 宿主组件（如div，span等）
class ElementWrapper {
  constructor(type) {
    this.type = type;
    this.props = Object.create(null);
    this[childrenSymbol] = [];
    this.children = [];
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  getChildren() {
    return this.children.map((child) => child.vdom);
  }
  appendChild(vchild) {
    this[childrenSymbol].push(vchild);
    this.children.push(vchild.vdom);
  }
  get vdom() {
    return this;
  }
  mountTo(range) {
    this.range = range;
    // createComment() 方法用来创建并返回一个注释节点.
    let placeholder = document.createComment("placeholder");
    let endRange = document.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEnd(range.endContainer, range.endOffset);
    endRange.insertNode(placeholder);
    range.deleteContents();
    let element = document.createElement(this.type);
    for (let name in this.props) {
      let value = this.props[name];
      //添加绑定事件
      if (name.match(/^on([\s\S]+)$/)) {
        let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase());
        element.addEventListener(eventName, value);
      }
      //添加class
      else if (name === "className") {
        element.setAttribute("class", value);
      }
      //添加属性
      else {
        element.setAttribute(name, value);
      }
    }
    for (let child of this.children) {
      let range = document.createRange();
      if (element.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      child.mountTo(range);
    }
    range.insertNode(element);
  }
}
// 宿主组件 (text)
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
    this.type = "#text";
    this.children = [];
    this.props = Object.create(null);
  }
  mountTo(range) {
    this.range = range;
    // 从文档中移除 Range 包含的内容。
    range.deleteContents();
    // 在 Range 的起点处插入一个节点。
    range.insertNode(this.root);
  }
  get vdom() {
    return this;
  }
}

// React 组件元素
export class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  get type() {
    return this.constructor.name;
  }
  setAttribute(name, value) {
    this.props[name] = value;
    this[name] = value;
  }
  mountTo(range) {
    this.range = range;
    this.update();
  }
  update() {
    let vdom = this.vdom
    if (this.oldVdom) {
      let isSameNode = (node1, node2) => {
        if (node1.type !== node2.type)
          return false
        for (let name in node1.props) {
  
          if (typeof node1.props[name] === "object" && typeof node2.props[name] === 'object' &&
            JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name]))
            continue
          if (node1.props[name] !== node2.props[name])
            return false
        }
        if (Object.keys(node1.props).length !== Object.keys(node2.props).length)
          return false
  
        return true
      }
  
      let isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2))
          return false
        if (node1.children.length !== node2.children.length)
          return false
        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i]))
            return false
        }
        return true
      }
      let replace = (newTree, oldTree) => {
        if (isSameTree(newTree, oldTree)) return
        if (!isSameNode(newTree, oldTree)) {
          newTree.mountTo(oldTree.range)
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i])
          }
        }
      }
      replace(vdom, this.oldVdom)
    } else {
      vdom.mountTo(this.range)
    }
    this.oldVdom = vdom
  }
  get vdom() {
    return this.render().vdom;
  }
  appendChild(vchild) {
    return this.children.push(vchild);
  }
  setState(state) {
    const merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === "object" && newState[p] !== null) {
          if (typeof oldState[p] !== "object") {
            if (newState[p] instanceof Array) {
              oldState[p] = [];
            } else {
              oldState[p] = {};
            }
          }
          merge(oldState[p], newState[p]);
        } else {
          oldState[p] = newState[p];
        }
      }
    };
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    this.update();
  }
}

// React
export const JReact = {
  // Babel 会把 JSX 转译成一个名为 React.createElement() 的函数调用。
  // <h1 id=“myid” class=“myclass”>我是帅哥</h1>
  // const myh1=React.createElement("h1",{id:"myid",class:"myclass"},"我是帅哥")
  createElement(type, attributes, ...children) {
    // console.log("createElement", arguments);
    let element;
    // 如果 jsx 标签是小写的(原生)，那么这里的第一个参数是个字符串不是变量
    if (typeof type === "string") {
      element = new ElementWrapper(type);
    } else {
      element = new type();
    }
    for (let name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    const insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === "object" && child instanceof Array) {
          insertChildren(child);
        } else {
          if (child === null || child === void 0) {
            child = "";
          }
          if (
            !(child instanceof Component) &&
            !(child instanceof ElementWrapper) &&
            !(child instanceof TextWrapper)
          ) {
            child = String(child);
          }
          if (typeof child === "string") {
            child = new TextWrapper(child);
          }
          element.appendChild(child);
        }
      }
    };
    insertChildren(children);
    // console.log("element", element);
    return element;
  },
  // 主要原因是 jsx 是一个混合内容，组件和 HTML 是并存的，如果不是 HTML 的元素的话，无法使用 document.body.appendChild 
  // 源码位置：packages/react-dom/src/client/ReactDOM.js
  // render: function (element, container, callback) {
  render(element, continer) {
    // 返回一个 Range 对象
    // Range 接口表示一个包含节点与文本节点的一部分的文档片段
    let range = document.createRange();
    if (continer.children.length) {
      // Range.setStartAfter()
      // 以其它节点为基准，设置 Range 的起点。
      range.setStartAfter(continer.lastChild);
      // Range.setEndAfter()
      // 以其它节点为基准，设置 Range 的终点。
      range.setEndAfter(continer.lastChild);
    } else {
      range.setStart(continer, 0);
      range.setEnd(continer, 0);
    }

    element.mountTo(range);
  },
};
