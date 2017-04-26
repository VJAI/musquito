class ActionQueue {

  actions = {};

  add(name, action) {
    this.actions[name] = action;
  }

  remove(name) {
    delete this.actions[name];
  }

  clear() {
    this.actions = {};
  }

  run() {
    for(const action in this.actions) {
      this.actions[action]();
      this.remove(action);
    }
  }
}

export { ActionQueue as default };
