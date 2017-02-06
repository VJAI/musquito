(function (ctxClass) {
  
  'use strict';

  var emptyFn = function () {};

  var BuzzerState = {
    Constructed: 0,
    Ready: 1,
    Done: 2
  };
  
  function Buzzer() {
    this.ctx = null;
    this.muted = false;
    this.vol = 1.0;
    this.state = BuzzerState.Constructed;
  }
  
  Buzzer.prototype.setup = function (context) {
    if(this.state !== BuzzerState.Constructed) {
      return;
    }
    
    this.ctx = context || new ctxClass();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = this.vol;
    this.gain.connect(this.ctx.destination);
    this.state = BuzzerState.Ready;
  };
  
  Buzzer.prototype.volume = function (vol) {
    this.vol = vol;
    this.gain.value = this.vol;
    return this.gain.value;
  };
  
  Buzzer.prototype.mute = function () {
    if(this.muted) {
      return;
    }
    
    this.gain.gain.value = 0;
    this.muted = true;
  };
  
  Buzzer.prototype.unmute = function () {
    if(!this.muted) {
      return;
    }
    
    this.gain.gain.value = this.vol;
    this.muted = false;
  };
  
  Buzzer.prototype.tearDown = function () {
    this.state = BuzzerState.Done;
  };
  
  Buzzer.prototype.context = function () {
    return this.ctx;
  };
  
  Buzzer.prototype.isMuted = function () {
    return this.muted;
  };
  
  var buzzer = new Buzzer();
  var cache = {};
  
  function Buzz(args) {
    buzzer.setup();
    
    this.id = Math.round(Date.now() * Math.random());
    this.src = args.src;
    this.volume = args.volume || 1.0;
    this.buffer = null;
    var context = buzzer.context();
    this.gain = context.createGain();
    this.gain.connect(buzzer.gain);
    
    this.gain.gain.value = this.volume;
    this.loaded = false;
  }
  
  Buzz.prototype.load = function (success, error) {
    if(this.loaded) {
      success.call(this, this.buffer);
      return;
    }
    
    if(cache.hasOwnProperty(this.src)) {
      this.buffer = cache[this.src];
      success.call(this, this.buffer);
      return;
    }
    
    var xhr = new XMLHttpRequest(), self = this;
    xhr.open('GET', this.src, true);
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('load', function () {
      buzzer.context().decodeAudioData(xhr.response, function (buffer) {
        cache[self.src] = buffer;
        self.buffer = buffer;
        self.loaded = true;
        success.call(self, self.buffer);
      }, error);
    });
    xhr.addEventListener('error', error);
    xhr.send();
  };
  
  Buzz.prototype.play = function (end, error) {
    var play = function () {
      var bufferSource = buzzer.context().createBufferSource();
      bufferSource.buffer = this.buffer;
      bufferSource.connect(this.gain);
      bufferSource.start(0);
    };

    var err = function (e) {
      console.log(e);
    };

    if(!this.loaded) {
      this.load(play, error || err);
      return;
    }

    play.call(this);
  };
  
  Buzz.prototype.stop = function () {
    
  };
  
  Buzz.prototype.pause = function () {
    
  };
  
  Buzz.prototype.mute = function () {
    
  };
  
  Buzz.prototype.volume = function () {
    
  };
  
  window.buzzer = buzzer;
  window.Buzz = Buzz;
  
})(window.AudioContext || window.webkitAudioContext);