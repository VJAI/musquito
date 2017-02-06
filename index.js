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
      if(buzzer.isMuted) {
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
      var src = buzzCreateForm["buzz-sound"].value,
          volume = parseFloat(buzzCreateForm["buzz-volume"].value),
          loop = buzzCreateForm["buzz-loop"].value;
      
      var buzz = new Buzz({
        src: src,
        volume: volume,
        loop: loop
      });
      buzzes.push(buzz);
      
      var buzzLi = '<li><p><em>#sound#</em><button class="buzz-play">Play</button><button class="buzz-pause">Pause</button><button class="buzz-mute">Mute</button><button class="buzz-stop">Stop</button><input class="buzz-volume" type="range" min="0.0" max="1.0" step="0.1" value="1.0"/></p></li>'.replace('#sound#', src);
      
      buzzesList.innerHTML += buzzLi;
      
      event.preventDefault();
      return false;
    }
    
    function pauseBuzz() {
      
    }
    
    function muteBuzz() {
      
    }
    
    function stopBuzz() {
      
    }
  }
  
  window.addEventListener('load', function () {
    buzzerTester();
  }, false);
})();