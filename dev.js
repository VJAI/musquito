import buzzer from './src/core/Buzzer';
import BufferBuzz from './src/core/BufferBuzz';
import MediaBuzz from './src/core/MediaBuzz';

/**
 * Handles all the functionalities related to the test page.
 */
class BuzzerTester {

  _buzzes = [];

  _buzzerMuteBtn = null;

  _buzzerVolumeSlider = null;

  _buzzCreateForm = null;

  _buzzesList = null;

  /**
   * 
   */
  init() {
    this._buzzerMuteBtn = document.getElementById('buzzer-mute');
    this._buzzerMuteBtn.addEventListener('click', this._muteBuzzer.bind(this));

    this._buzzerVolumeSlider = document.getElementById('buzzer-volume');
    this._buzzerVolumeSlider.addEventListener('change', this._changeVolumeBuzzer.bind(this));

    this._buzzCreateForm = document.forms.buzzCreateForm;
    this._buzzCreateForm.addEventListener('submit', this._createNewBuzz.bind(this));

    this._buzzesList = document.getElementById('buzzes');
  }

  /**
   *
   * @private
   */
  _muteBuzzer() {
    if (buzzer.muted()) {
      buzzer.unmute();
      this._buzzerMuteBtn.innerHTML = 'Mute';
    } else {
      buzzer.mute();
      this._buzzerMuteBtn.innerHTML = 'Un-Mute';
    }
  }

  /**
   *
   * @private
   */
  _changeVolumeBuzzer() {
    let volume = parseFloat(this._buzzerVolumeSlider.value);
    buzzer.volume(volume);
  }

  /**
   *
   * @param event
   * @return {boolean}
   * @private
   */
  _createNewBuzz(event) {
    let isSprite = this._buzzCreateForm['buzz-sound'].value === 'sprite',
      src = 'sounds/' + (isSprite ? 'sprite.mp3' : this._buzzCreateForm['buzz-sound'].value),
      volume = parseFloat(this._buzzCreateForm['buzz-volume'].value),
      loop = this._buzzCreateForm['buzz-loop'].checked,
      buffer = this._buzzCreateForm['buzz-buffer'].checked,
      buzzType = buffer ? MediaBuzz : BufferBuzz;

    let buzz = new buzzType({
      src: src,
      sprite: isSprite ? {
        beep: [0, 0.48108843537414964],
        button: [2, 2.4290249433106577],
        click: [4, 4.672018140589569]
      } : undefined,
      volume: volume,
      loop: loop
    });
    this._buzzes.push(buzz);

    let buzzLi = document.createElement('li');
    buzzLi.innerHTML = `<p>
                          <em>${src}</em>
                          <select class="buzz-sprite-sound" style="display: ${isSprite ? 'inline' : 'none'}">
                            <option>beep</option>
                            <option>button</option>
                            <option>click</option>
                          </select>
                          <button class="buzz-play">Play</button>
                          <button class="buzz-pause">Pause</button>
                          <button class="buzz-mute">Mute</button>
                          <button class="buzz-stop">Stop</button>
                          <input class="buzz-volume" type="range" min="0.0" max="1.0" step="0.1" value="1.0"/>
                        </p>`;
    this._buzzesList.appendChild(buzzLi);

    buzzLi.querySelector('.buzz-play').addEventListener('click', () => {
      buzz.play(isSprite ? buzzLi.querySelector('.buzz-sprite-sound').value : undefined);
    });
    buzzLi.querySelector('.buzz-pause').addEventListener('click', () => buzz.pause());
    buzzLi.querySelector('.buzz-mute').addEventListener('click', () => {
      if (buzz.muted()) {
        buzz.unmute();
        this.innerHTML = 'Mute';
      } else {
        buzz.mute();
        this.innerHTML = 'Un-Mute';
      }
    });
    buzzLi.querySelector('.buzz-stop').addEventListener('click', () => buzz.stop());
    buzzLi.querySelector('.buzz-volume').addEventListener('change', () => {
      buzz.volume(parseFloat(buzzLi.querySelector('.buzz-volume').value));
    });

    event.preventDefault();
    return false;
  }
}

window.addEventListener('load', () => new BuzzerTester().init());
