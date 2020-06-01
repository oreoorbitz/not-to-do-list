const pubsub = {
  events: {},
  subscribe: function(eventName, fn) {
    // console.log(`PUBSUB: someone just subscribed to know about ${eventName}`);
    //add an event with a name as new or to existing list
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  unsubscribe: function(eventName, fn) {
    // console.log(`PUBSUB: someone just UNsubscribed from ${eventName}`);
    //remove an event function by name
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(f => f !== fn);
    }
  },
  publish: function(eventName, data) {
    //console.log(`PUBSUB: Making an broadcast about ${eventName} with ${data}`);
    //emit|publish|announce the event to anyone who is subscribed
    if (this.events[eventName]) {
      this.events[eventName].forEach(f => {
        f(data);
      });
    }
  }
};
const clear = function(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
};

const container = document.querySelector(".js-container");

class ButtonMutator {
  constructor(domNode) {
    this.backUpNode = domNode.cloneNode();
    this.domNode = domNode;
  }

  get node() {
    return this.domNode;
  }

  changeText(text) {
    return (this.domNode.innerText = text);
  }

  resetText() {
    return (this.domNode.innerText = this.backUpNode.innerText);
  }

  toggleClass(className) {
    return this.domNode.classList.toggle(className);
  }
}

const titleMutator = {
  title: "",
  titleInputTemplate: document.body
    .querySelector("template")
    .content.querySelector("input"),
  titleTemplate: document.body
    .querySelector("template")
    .content.querySelector(".js-title"),

  setEventListener: targetNode => {
    targetNode.addEventListener("dblclick", titleMutator.setInput);
  },
  setInput: event => {
    titleMutator.title = event.target.innerText;
    let title = event.target;
    let titleParent = title.parentElement;
    if (title.classList.contains("js-title")) {
      title.replaceWith(titleMutator.titleInputTemplate.cloneNode(false));
      let input = titleParent.querySelector(".title-input");
      input.addEventListener("keyup", titleMutator.inputHandler);
    }
  },
  inputHandler: event => {
    if (event.keyCode === 13) {
      titleMutator.setTitle(event.target.value, event.target);
    }
  },
  setTitle: (title, target) => {
    let originalValue = titleMutator.title;
    let titleNode = titleMutator.titleTemplate.cloneNode(false);
    titleNode.innerText = title;
    target.replaceWith(titleNode);
    toNotDo.list = toNotDo.list.map(e => {
      if (e === originalValue) {
        return title;
      } else {
        return e;
      }
    });
    pubsub.publish("listItemUpdated", toNotDo.list);
  }
};

const addToListBtn = new ButtonMutator(document.querySelector(".js-button"));

const toNotDoForm = {
  listItem: [],
  render: () => {
    addToListBtn.node.addEventListener("click", toNotDoForm.addToList);
  },
  addToList: () => {
    const input = document.querySelector(".js-input");
    if (toNotDoForm.validateInput(input.value)) {
      title = input.value;
      input.value = "";
      pubsub.publish("listItemAdded", title);
    } else {
      return;
    }
  },
  validateInput: inputValue => {
    if (inputValue === "") {
      addToListBtn.toggleClass("danger");
      addToListBtn.changeText("You didnt input anything");
      setTimeout(function() {
        addToListBtn.toggleClass("danger");
        addToListBtn.changeText("Try again");
      }, 2000);
      return false;
    } else {
      return true;
    }
  }
};

const toNotDo = {
  list: [],
  render: () => {
    const ul = document.querySelector(".js-ul");
    pubsub.subscribe("listItemAdded", toNotDo.listItemAdded);

    //add delete event listener
    ul.addEventListener("click", toNotDo.listItemDeleted);
  },
  listItemAdded: title => {
    let list = new Set(toNotDo.list);
    list.add(title);
    toNotDo.list = Array.from(list).sort();
    pubsub.publish("listItemUpdated", toNotDo.list);
    toNotDo.updateList(list);
  },
  updateList: list => {
    //clone the template
    const template = document.body.querySelector("template");
    let templateLi = template.content
      .querySelector(".js-toNotDo")
      .cloneNode(true);
    //clear the real list
    const ul = document.querySelector(".js-ul");
    clear(ul);

    // add list to dom
    list.forEach(title => {
      li = templateLi.cloneNode(true);
      li.querySelector(".js-title").innerText = title;
      ul.appendChild(li.cloneNode(true));
    });
    //enable title editing
    Array.from(ul.childNodes).forEach(e => titleMutator.setEventListener(e));
  },
  listItemDeleted: event => {
    if (event.target.classList.contains("js-delete-button")) {
      const deletedTitle = event.target.parentElement.querySelector(".js-title")
        .innerText;
      toNotDo.list = toNotDo.list.filter(title => title !== deletedTitle);
      pubsub.publish("listItemUpdated", toNotDo.list);
      toNotDo.updateList(toNotDo.list);
    }
  }
};

const localStorage = {
  storage: window.localStorage,
  render: () => {
    window.addEventListener("load", () => {
      let list = JSON.parse(localStorage.storage.getItem("list"));
      toNotDo.list = list;
      pubsub.subscribe("listItemAdded", localStorage.addItemToStorage);
      toNotDo.updateList(list);
      pubsub.subscribe("listItemUpdated", localStorage.updateLocalStorage);
    });
  },
  addItemToStorage: title => {
    if (localStorage.storage.getItem("list") === null) {
      localStorage.storage.setItem("list", "[]");
    } else {
      let storageList = JSON.parse(localStorage.storage.getItem("list"));
      storageList.push(title);
      localStorage.storage.setItem("list", JSON.stringify(storageList));
    }
  },
  updateLocalStorage: list => {
    localStorage.storage.setItem("list", JSON.stringify(list));
  }
};

toNotDoForm.render(container);
toNotDo.render();
localStorage.render();
