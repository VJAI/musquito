class Html5AudioPool {

  maxNodes = 5;

  audioNodes = [];

  constructor(maxNodes = 5){
    typeof maxNodes === 'number' && (this.maxNodes = maxNodes);
  }

  getNode(src = null) {
    throw new Error('Not Implemented');
  }
}

export default Html5AudioPool;
