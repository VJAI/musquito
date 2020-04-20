<p align="center">
  <img src="https://github.com/VJAI/musquito/blob/master/musquito.png" />
</p>

# musquito

[musquito](http://musquitojs.com) is an audio engine created using Web Audio API for HTML5 games and interactive websites. It provides 
a simple abstraction to create and play sounds easier.

Below are some of the core features supported by the library.

- Built on the powerful Web Audio API
- Simple API to create and play sounds
- Supports variety of codecs
- Supports audio sprites
- Supports streaming using HTML5 audio nodes
- Fading
- Caching
- Auto Garbage Management

## Browser Support

- Google Chrome
- Firefox
- Safari
- Opera
- Microsoft Edge


## Installation

At this time *musquito* is available only in npm and you can install it using the below command.

```
npm install musquito --save
```

You can also directly reference files available from the distribution folder.

```
<script src="musquito/dist/musquito-1.0.0.min.js"></script>
```


## "Hello World" example

A simple example of how to create and play a gun fire sound.

### ES6 and above

```js
import $buzz from 'musquito';

const buzz = $buzz('gunfire.mp3');

buzz.play();
```

### Classic JavaScript

```js
var buzz = $buzz('gunfire.mp3');

buzz.play();
```


## Advanced example

The below example shows how you can pass additional parameters like volume, rate and event handlers.

```js
const buzz = $buzz({
  src: ['gunfire.mp3', 'gunfire.wav'],
  volume: 0.5,
  rate: 2,
  onplaystart: () => console.log('Playback started'),
  onplayend: () => console.log('Playback ended')
});

buzz.play();
```


## Using sprites

Audio Sprites are like image sprites concatenates multiple small sounds in a single file. You can create audio sprite using this [tool](https://github.com/tonistiigi/audiosprite). 

Below is an example of how to use sprites.

```js
const buzz = $buzz({
  src: 'gamesprite.mp3',
  sprite:{
    'gun': [0, 0.48],
    'bomb': [2, 2.42],
    'greenade': [4, 4.67]
  }
});

buzz.play('gun');
buzz.play('bomb');
```


## Playing Long Audio Files

To stream long audio files and play using HTML5 audio node you can pass the `stream` parameter as true.

```js
const buzz = $buzz({
  src: 'bg.mp3',
  stream: true
});

buzz.play();
```


## Fading Sounds

You can fade the volume of a playing sound linearly or exponentially as shown below.

```js
const buzz = $buzz({
  src: 'bg.mp3'
});

buzz.play();
...

buzz.fade(0, 3);
```


For demos and detailed documentation please visit [here](http://musquitojs.com).


## API

### `$buzz` function

**`$buzz(args: string|Array<string>|object)`**

`$buzz` is the single API that helps you to create and manage sounds. It's a function that returns a `Buzz` object. The `Buzz` object 
helps to control group of sounds created for a single audio source.

You can pass a single audio source, array of audio sources or an object. If an array of audio sources is passed then the first compatible one is picked for playing. 
If you need to pass additional information like initial volume, playback speed then you need to pass an object.

#### The different options you can pass in arguments object for the `$buzz` function.

| Name | Type | Required | Default | Description |
|------|------|:--------:|:-------:|-------------|
| src | string, Array<string> | yes | | Single or array of audio sources. If an array of audio sources is passed then the first compatible one is picked for playing. |
| id | number | no | Auto-generated | The unique identifier for the `Buzz` object. |
| volume | number | no | 1.0 | The initial volume of the sound. The value should be from `0.0` to `1.0`. |
| rate | number | no | 1.0 | The initial playback speed. The value should be from `0.5` to `5.0`. |
| loop | boolean | no | false | Pass `true` to play the sound repeatedly. |
| muted | boolean | no | false | Pass `true` to keep the sound muted initially. |
| preload | boolean | no | false | Pass `true` to pre-load the sound. |
| autoplay | boolean | no | false | Pass `true` to play the sound at-once created. |
| stream | boolean | no | false | Passing `true` will use HTML5 audio node for playing the sound. This option you can use to play long audio files like background music in a game. This feature is available only in version v2. |
| format | string, Array<string> | no | false | Single or array of audio formats for the passed audio sources. |
| sprite | object | no | | The sprite definition object that contains the starting and ending positions of each sound embedded in the sprite. |
| onload | function | no | | The event handler for "load" event. |
| onloadprogress | function | no | | The event handler for "loadprogress" event. |
| onunload | function | no | | The event handler for "unload" event. |
| onplaystart | function | no | | The event handler for "playstart" event. |
| onplayend | function | no | | The event handler for "playend" event. |
| onstop | function | no | | The event handler for "stop" event. |
| onpause | function | no | | The event handler for "pause" event. |
| onmute | function | no | | The event handler for "mute" event. |
| onvolume | function | no | | The event handler for "volume" event. |
| onrate | function | no | | The event handler for "rate" event. |
| onseek | function | no | | The event handler for "seek" event. |
| onerror | function | no | | The event handler for "error" event. |
| ondestroy | function | no | | The event handler for "destroy" event. |

### `Buzz` object methods

| Method | Returns | Description |
|--------|:-------:|-------------|
| load(soundId?: string) | Buzz | Loads the audio buffer or preloads a HTML5 audio node. The `soundId` can be passed only in the case stream buzz type. When you pass it that particular sound's audio node will be pre-loaded. |
| play(soundOrId?: string, number) | Buzz | Plays a new sound or the passed sound defined in the sprite or the sound that belongs to the passed id. |
| pause(id?: number) | Buzz | Pauses the sound belongs to the passed id or all the sounds belongs to this group. |
| stop(id?: number) | Buzz | Stops the sound belongs to the passed id or all the sounds belongs to this group. |
| mute(id?: number) | Buzz | Mutes the sound belongs to the passed id or all the sounds belongs to this group. |
| unmute(id?: number) | Buzz | Un-mutes the sound belongs to the passed id or all the sounds belongs to this group. |
| volume(volume?: number, id?: number) | Buzz, number | Gets/sets the volume of the passed sound or the group. The passed value should be from `0.0` to `1.0`. |
| rate(rate?: number, id?: number) | Buzz, number | Gets/sets the rate of the passed sound or the group. The passed value should be from `0.5` to `5.0`. |
| seek(id: number, seek?: number) | Buzz, number | Gets/sets the current playback position of the sound. |
| loop(loop?: boolean, id?: number) | Buzz, boolean | Gets/sets the looping behavior of a sound or the group. |
| fade(to: number, duration: number, type = 'linear', id?: number) | Buzz | Fades the volume of a playing sound or all sounds belongs to the group. |
| fadeStop(id?: number) | Buzz | Stops the current running fade of the passed sound or all sounds belongs to the group. |
| playing(id: number) | boolean | Returns true if the passed sound is playing. |
| muted(id?: number) | boolean | Returns true if the passed sound is muted or the group is muted. |
| state(id?: number) | BuzzState, SoundState | Returns the state of the passed sound or the group. |
| duration(id?: number) | number | Returns the duration of the passed sound or the total duration of the sound. |
| unload() | Buzz | Unloads the loaded audio buffer. |
| destroy() | Buzz | Stops and destroys all the sounds belong to this group and release other dependencies. |
| on(eventName: string, handler: function, once = false, id?: number) | Buzz | Subscribes to an event for the sound or the group. |
| off(eventName: string, handler: function, id?: number) | Buzz | Un-subscribes from an event for the sound or the group. |
| id() | number | Returns the unique id of the sound. |
| loadState() | LoadState | Returns the audio resource loading status. The different values are "notloaded", "loading" and "loaded". |
| isLoaded() | boolean | Returns true if the audio source is loaded. |
| sound(id: number) | Sound | Returns the sound for the passed id. |
| sounds() | Array<Sound> | Returns all the sounds belongs to this buzz group. |
| alive(id: number) | boolean | Returns `true` if the passed sound exists. |
| gain() | GainNode | Returns the gain node. |

### `$buzz` static / global methods

These are wrapper methods of engine that helps to control the audio globally. You can invoke this method by `$buzz.[methodname](args)`.

| Method | Returns | Description |
|--------|:-------:|-------------|
| setup(args?: object) | $buzz | Sets-up the audio engine. The different parameters you can pass in arguments object are `volume`, `muted`, `maxNodesPerSource`, `cleanUpInterval`, `autoEnable` and event handler functions like `onstop`, `onmute`, `onvolume`, `onsuspend`, `onresume`, `onerror` and `ondone`. |
| load(urls: string, Array<string>, progressCallback: function) | Promise | Loads single or multiple audio resources into audio buffers and returns them. |
| loadMedia(urls: string, Array<string>) | Promise | Pre-loads single or multiple HTML5 audio nodes with the passed resources and returns them. |
| unload(urls: string, Array<string>) | $buzz | Unloads single or multiple loaded audio buffers from cache. |
| unloadMedia(urls: string, Array<string>) | $buzz | Releases audio nodes allocated for the passed urls. |
| mute() | $buzz | Mutes the engine. |
| unmute() | $buzz | Un-mutes the engine. |
| volume(vol?: number) | $buzz, number | Gets/sets the volume for the audio engine that controls global volume for all sounds. |
| stop() | $buzz | Stops all the currently playing sounds. |
| suspend() | $buzz | Stops all the playing sounds and suspends the engine immediately. |
| resume() | $buzz | Resumes the engine from the suspended mode. |
| terminate() | $buzz | Shuts down the engine. |
| muted() | boolean | Returns whether the engine is currently muted or not. |
| state() | EngineState | Returns the state of the engine. The different values are "notready", "ready", "suspending", "suspended", "resuming", "destroying", "done" and "no-audio". |
| buzz(id: number) | Buzz | Returns the buzz for the passed id. |
| buzzes() | Array<Buzz> | Returns all the buzzes. |
| context() | AudioContext | Returns the created audio context. |
| isAudioAvailable() | boolean | Returns true if Web Audio API is available. |
| on(eventName: string, handler: function, once = false) | $buzz | Subscribes to an event. |
| off(eventName: string, handler: function) | $buzz | Un-subscribes from an event. |
| masterGain() | GainNode | Returns the master gain node. |
| bufferLoader() | BufferLoader | Returns buffer loader. |
| mediaLoader() | MediaLoader | Returns media loader. |

## License

MIT

Copyright © 2020 · Vijaya Anand · All Rights Reserved.
  
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
