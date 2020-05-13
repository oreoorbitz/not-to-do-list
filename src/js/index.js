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
}
const clear = function(node) {
       while (node.firstChild) {
         node.removeChild(node.firstChild);
       }
}
const container = document.querySelector(".js-container");
class ButtonMutator {
  constructor(domNode) {
    this.backUpNode = domNode.cloneNode()
    this.domNode = domNode
  }

  get node() {
    return this.domNode;
  }

  changeText(text) {
    return this.domNode.innerText = text
  }

  resetText() {
    return (this.domNode.innerText = this.backUpNode.innerText);
  }

  toggleClass(className) {
    return this.domNode.classList.toggle(className);
  }
}
const addToListBtn = new ButtonMutator(document.querySelector(".js-button"));


const toNotDoForm = {
  listItem: [],
  render: () => {
  addToListBtn.node.addEventListener("click", toNotDoForm.addToList);
},
 addToList: () => {
    const input = document.querySelector(".js-input");
    if (toNotDoForm.validateInput(input.value)) {
      title = input.value
      input.value = ''
      pubsub.publish("listItemAdded", title);
    } else {
      return
    }
 },
 validateInput: inputValue => {
  if (inputValue === '') {
    addToListBtn.toggleClass("danger");
    addToListBtn.changeText('You didnt input anything')
    setTimeout(function() {
         addToListBtn.toggleClass("danger");
         addToListBtn.changeText("Try again");
    }, 2000);
    return false
  } else {
    return true
  }
 }
}

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


     const ul = document.querySelector(".js-ul");
     let li = ul.querySelector(".js-toNotDo").cloneNode(true);
     clear(ul);

     // add list to dom
     toNotDo.list.forEach( title => {
      li = li.cloneNode(true)
      li.querySelector('.js-title').innerText = title
      ul.appendChild(li.cloneNode(true))
     })

  },
  listItemDeleted: event => {
    if (event.target.classList.contains("js-delete-button")) {
      event.target.parentElement.remove()
      const deletedTitle = event.target.parentElement.querySelector('.js-title')
      toNotDo.list = toNotDo.list.filter(title => title !== deletedTitle);

    }
  }
};

 toNotDoForm.render(container);
 toNotDo.render()

