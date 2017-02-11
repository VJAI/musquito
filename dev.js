import buzzer from './src/core/Buzzer';
import Buzz from './src/core/Buzz';

function buzzerTester() {
  
  init();
  
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
    if (buzzer.muted()) {
      buzzer.unmute();
      buzzerMuteBtn.innerHTML = 'Mute';
    } else {
      buzzer.mute();
      buzzerMuteBtn.innerHTML = 'Un-Mute';
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
    
    buzzLi.querySelector('.buzz-play').addEventListener('click', function () {
      buzz.play();
    }, false);
    
    buzzLi.querySelector('.buzz-pause').addEventListener('click', function () {
      buzz.pause();
    }, false);
    
    buzzLi.querySelector('.buzz-mute').addEventListener('click', function () {
      if (buzz.muted()) {
        buzz.unmute();
        this.innerHTML = 'Mute';
      } else {
        buzz.mute();
        this.innerHTML = 'Un-Mute';
      }
    }, false);
    
    buzzLi.querySelector('.buzz-stop').addEventListener('click', function () {
      buzz.stop();
    }, false);
    
    buzzLi.querySelector('.buzz-volume').addEventListener('change', function () {
      buzz.volume(this.value);
    }, false);
    
    event.preventDefault();
    return false;
  }
}

window.addEventListener('load', function () {
  buzzerTester();
}, false);
