<script setup>
import { ref, watch } from "vue";
import { Notification } from "@arco-design/web-vue";
import OsuEditor from "@/components/osu-editor/index.vue";

const reload = ref(true);
const musicInfo = ref({
  name: "",
  keys_num: 3,
  bpm: 80,
  file: "",
  osu: "osu file format v14\n\n[General]\nAudioFilename: audio.mp3\nAudioLeadIn: 0\nPreviewTime: 0\nCountdown: 0\nSampleSet: None\nStackLeniency: 0.7\nMode: 3\nLetterboxInBreaks: 0\nWidescreenStoryboard: 0\n\n[Editor]\nDistanceSpacing: 1.22\nBeatDivisor: 4\nGridSize: 4\nTimelineZoom: 1\n\n[Metadata]\nTitle: 20230417380093123_basic_pitch\nTitleUnicode: 20230417380093123_basic_pitch\nArtist: Unknow\nArtistUnicode: Unknow\nCreator: OsuAutoMapper\nVersion: None\nSource: None\nTags: \nBeatmapID: 0\nBeatmapSetID: 0\n\n[Difficulty]\nHPDrainRate: 10.0\nCircleSize: 3.0\nOverallDifficulty: 5.0\nApproachRate: 5.0\nSliderMultiplier: 1.4\nSliderTickRate: 1.0\n\n[Events]\n0,0,bg.png,0,0\n\n[TimingPoints]\n0,300,1,0,0,100,1,0\n\n[Colours]\n\n[HitObjects]\n350,192,661,1,0,0:0:0:0:B6.wav\n",
});

const isPreviewing = ref(false);
const editor = ref();

function loadMusicFile(e) {
  const file = e.target.files[0];
  const { name } = file;
  if (name.endsWith(".mp3")) {
    musicInfo.value = {
      ...musicInfo.value,
      file,
      name: file.name,
    }; 
  } else {
    Notification.error("请选择mp3文件");
  }
}

function preview() {
  if (!isPreviewing.value) {
    Notification.info("试玩将在3s后开始");
  }
  isPreviewing.value = !isPreviewing.value;
}


watch(
  musicInfo,
  () => {
    reload.value = false;
    setTimeout(() => {
      reload.value = true;
    }, 1000);
  },
  { deep: true }
);
</script>

<template>
  <div>
    <div class="flex">
      <div class="form-item">
        音乐文件: <input type="file" @change="loadMusicFile" accept="*.mp3" />
      </div>
      <a-tooltip content="决定游戏难度(音符密度)">
        <div class="form-item bpm">
          BPM: <input type="number" disabled v-model="musicInfo.bpm" min="80" />
        </div>
      </a-tooltip>
      <a-tooltip content="几个轨道, 暂不支持编辑">
        <div class="form-item stacks">
          轨道数量:
          <input
            type="number"
            disabled
            v-model="musicInfo.keys_num"
            min="3"
            max="4"
          />
        </div>
      </a-tooltip>
      
      <div class="form-item" v-if="musicInfo.file">
        <button @click="preview">
          {{ !isPreviewing ? "Play" : "Stop Play" }}
        </button>
      </div>
    </div>
    <OsuEditor
      v-if="reload"
      class="mt-16"
      :musicInfo="musicInfo"
      @handleChangeMode="changeMode"
      :isPreviewing="isPreviewing"
      ref="editor"
    />
  </div>
</template>

<style lang="less">
#app {
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  .form-item {
    &.bpm,
    &.stacks {
      margin-right: 16px;
      input {
        width: 50px;
      }
    }
  }
}
</style>
