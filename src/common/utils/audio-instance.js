export function getNewArrayBuffer(audioBuffer, dur) {
  const channels = audioBuffer.numberOfChannels;
  const rate = audioBuffer.sampleRate;
  const [start, end] = dur;

  const startOffset = start * rate;
  const endOffset = end === 0 ? audioBuffer.length : end * rate;
  const frameCount = endOffset - startOffset;
  const newAudioBuffer = new AudioContext().createBuffer(
    channels,
    endOffset - startOffset,
    rate
  );
  const anotherArray = new Float32Array(frameCount);
  const offset = 0;
  for (let channel = 0; channel < channels; channel++) {
    audioBuffer.copyFromChannel(anotherArray, channel, startOffset);
    newAudioBuffer.copyToChannel(anotherArray, channel, offset);
  }
  return {
    newAudioBuffer,
    frameCount,
  };
}

export function bufferToWave(abuffer, len) {
  const numOfChan = abuffer.numberOfChannels,
    length = len * numOfChan * 2 + 44,
    buffer = new ArrayBuffer(length),
    view = new DataView(buffer),
    channels = [];

  let i,
    sample,
    offset = 0,
    pos = 0;

  // write WAVE header
  // "RIFF"
  setUint32(0x46464952);
  // file length - 8
  setUint32(length - 8);
  // "WAVE"
  setUint32(0x45564157);
  // "fmt " chunk
  setUint32(0x20746d66);
  // length = 16
  setUint32(16);
  // PCM (uncompressed)
  setUint16(1);
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  // avg. bytes/sec
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  // block-align
  setUint16(numOfChan * 2);
  // 16-bit (hardcoded in this demo)
  setUint16(16);
  // "data" - chunk
  setUint32(0x61746164);
  // chunk length
  setUint32(length - pos - 4);

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));
  while (pos < length) {
    // interleave channels
    for (i = 0; i < numOfChan; i++) {
      // clamp
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      // scale to 16-bit signed int
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      // write 16-bit sample
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    // next source sample
    offset++;
  }
  // create Blob
  return new Blob([buffer], { type: "audio/wav" });
  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

export function checkIsMusicFile(fileName) {
  const reg = /\.(mp3|wma)/;
  return reg.test(fileName);
}

export function getNameFromUrl(url) {
  return url.split("/").at(-1);
}

export async function readMusic(f, dur) {
  const p = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target.result;
      const audioCtx = new AudioContext();
      audioCtx.decodeAudioData(res, function (audioBuffer) {
        const { newAudioBuffer, frameCount } = getNewArrayBuffer(
          audioBuffer,
          // audioCtx,
          dur
        );
        // 给页面元素设置src
        const blob = bufferToWave(newAudioBuffer, frameCount);
        resolve(URL.createObjectURL(blob));
      });
    };
    reader.readAsArrayBuffer(f);
  });
  return p;
}

export async function getMusicInstance(f) {
  const node = document.createElement("audio");
  if (typeof f === "string") {
    node.src = f;
  } else {
    node.src = URL.createObjectURL(f);
  }
  node.load()
  return new Promise((resolve, reject) => {
    node.addEventListener('loadedmetadata', () => {
      resolve({
        node,
        loaded: true
      });
    })
  });
}
