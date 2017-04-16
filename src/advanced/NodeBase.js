/**
 * The base class for all types of nodes.
 * @class
 */
class NodeBase {

  /**
   * The array of child nodes.
   * @type {Array<NodeBase>}
   * @private
   */
  _children = [];

  /**
   * Connect the node as one of it's child.
   * @param {NodeBase} node A node
   * @return {NodeBase}
   */
  connect(node) {
    this._children.push(node);
    return this;
  }

  /**
   * Remove the node from it's children collection.
   * @param {NodeBase} node The connected node
   * @return {NodeBase}
   */
  disconnect(node) {
    const index = this._children.indexOf(node);
    if (index > -1) {
      this._children.splice(index, 1);
    }

    return this;
  }

  /**
   * Executes the node's behavior and all of it's children.
   * @return {Promise}
   */
  execute() {
    return new Promise((resolve, reject) => {
      this._execute().then(() => {
        Promise.all(this._children.map(node => node.execute())).then(resolve, reject);
      });
    });
  }

  /**
   * Executed the node's behavior.
   * @protected
   */
  _execute() {
    throw new Error('Not implemented');
  }
}

export { NodeBase as default };
