/* eslint-disable */

import $buzz from './src/Buzz';

class EngineTester {

  _codeTextArea = null;

  _runBtn = null;

  _clearBtn = null;

  init() {
    window.$buzz = $buzz;

    this.run = this.run.bind(this);
    this.clear = this.clear.bind(this);

    this._codeTextArea = document.getElementById('code');
    this._runBtn = document.getElementById('run');
    this._clearBtn = document.getElementById('clear');

    this._runBtn.addEventListener('click', this.run);
    this._clearBtn.addEventListener('click', this.clear);

    this._codeTextArea.value = window.localStorage.getItem('code');
    this._codeTextArea.focus();
  }

  run() {
    const code = this._codeTextArea.value;
    window.localStorage.setItem('code', code);
    eval(code);
  }

  clear() {
    window.localStorage.setItem('code', '');
    this._codeTextArea.value = '';
  }
}

window.engineTester = new EngineTester();
window.addEventListener('load', () => engineTester.init());
