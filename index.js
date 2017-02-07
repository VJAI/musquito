(function () {

  'use strict';

  function buzzerTester() {

    init();

    var buzzer = window.buzzer, Buzz = window.Buzz;
    var buzzes = [];
    var buzzerMuteBtn, buzzerVolumeSlider, buzzCreateForm, buzzesList;

    function init() {
      buzzerMuteBtn = document.getElementById('buzzer-mute');
      buzzerMuteBtn.addEventListener('click', muteBuzzer, false);

      buzzerVolumeSlider = document.getElementById('buzzer-volume');
      buzzerVolumeSlider.addEventListener('change', changeVolumeBuzzer, false);

      buzzCreateForm = document.forms.buzzCreateForm;
      buzzCreateForm.addEventListener('submit', createNewBuzz, false);

      buzzesList = document.getElementById('buzzes');
    }

    function muteBuzzer() {
      if (buzzer.isMuted) {
        buzzer.unmute();
      } else {
        buzzer.mute();
      }
    }

    function changeVolumeBuzzer() {
      var volume = buzzerVolumeSlider.value;
      buzzer.volume(volume);
    }

    function createNewBuzz(event) {
      var src = 'sounds/' + buzzCreateForm["buzz-sound"].value,
        volume = parseFloat(buzzCreateForm["buzz-volume"].value),
        loop = buzzCreateForm["buzz-loop"].value;

      var buzz = new Buzz({
        src: src,
        volume: volume,
        loop: loop
      });
      buzzes.push(buzz);

      var buzzLi = document.createElement('li');
      buzzLi.innerHTML = '<p><em>#sound#</em><button class="buzz-play">Play</button><button class="buzz-pause">Pause</button><button class="buzz-mute">Mute</button><button class="buzz-stop">Stop</button><input class="buzz-volume" type="range" min="0.0" max="1.0" step="0.1" value="1.0"/></p>'
        .replace('#id#', buzz.id)
        .replace('#sound#', src);
      buzzesList.appendChild(buzzLi);

      var self = this;
      buzzLi.querySelector('.buzz-play').addEventListener('click', function () {
        playBuzz.call(self, buzz);
      }, false);

      buzzLi.querySelector('.buzz-pause').addEventListener('click', function () {
        pauseBuzz.call(self, buzz);
      }, false);

      buzzLi.querySelector('.buzz-mute').addEventListener('click', function () {
        muteBuzz.call(self, buzz);
      }, false);

      buzzLi.querySelector('.buzz-stop').addEventListener('click', function () {
        stopBuzz.call(self, buzz);
      }, false);

      buzzLi.querySelector('.buzz-volume').addEventListener('change', function () {
        changeVolumeBuzz.call(self, buzz, this.value);
      }, false);

      event.preventDefault();
      return false;
    }

    function playBuzz(buzz) {
      buzz.play();
    }

    function pauseBuzz(buzz) {
      buzz.pause();
    }

    function muteBuzz(buzz) {
      buzz.mute();
    }

    function stopBuzz(buzz) {
      buzz.stop();
    }

    function changeVolumeBuzz(buzz, volume) {
      buzz.volume(volume);
    }
  }

  window.addEventListener('load', function () {
    buzzerTester();
  }, false);
})();
