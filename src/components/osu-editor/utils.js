export function getUserEditBpm(musicLength, level, bpm) {
  const map = [80, 80, 100, 120, 130, 150];
  const selectedBpm = bpm || map[level - 1];
  const bpmPerSec = selectedBpm / 60;
  const len = Math.ceil(musicLength / 10) * 10;
  return Math.floor(bpmPerSec * len);
}
