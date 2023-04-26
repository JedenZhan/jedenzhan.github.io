<template>
  <div class="osu-editor">
    <div class="flex" v-if="instance.loaded">
      <!--["needBeatsNum", "stackInfo", 'canUsePrev', 'canBack', 'canPrev']  -->
      <section class="tools relative color-000 font-t8">
        <div v-show="!isPreviewing">
          <h1 class="font-t6">工具</h1>
          <h2 class="mt-12">
            {{ "删除音符" }}
          </h2>
          <p class="color-gray-600 font-t8 mt-4">
            {{ "点击删除" }}
          </p>
          <a-button type="outline" class="mt-8" @click="deleteAllNotes">清空</a-button>
          <h2 class="mt-12">{{ "添加音符" }} (可添加: {{ canAdd }})</h2>
          <p class="color-gray-600 mt-4 font-t8">
            {{ "点击按钮 / 键盘 1, 2, 3, 4" }}
          </p>
          <div class="flex mt-8">
            <a-button
              v-for="stack of stackInfo.stacks"
              class="add-note"
              shape="round"
              type="outline"
              :key="stack"
              size="XS"
              buttonStyle="black"
              :disabled="canAdd <= 0"
              @click="addNote(stack)"
            >
              L{{ stack }}
            </a-button>
          </div>
          <h2 class="mt-12">
            {{ "修改音符" }}
          </h2>
          <p class="color-gray-600 font-t8">
            {{ "拖动" }}
          </p>
          <h1 class="mt-12">{{ "播放速度" }}</h1>
          <div class="play-rate flex font-t8 mt-8 color-gray">
            <p
              v-for="item in [1, 0.75, 0.65, 0.5]"
              style="margin-right: 16px"
              class="pointer"
              :class="{
                highlight: playRate === item,
              }"
              :key="item"
              @click="setPlayRate(item)"
            >
              {{ item }}x
            </p>
          </div>
          <h1 class="mt-12">{{ "撤销" }}</h1>
          <div
            class="steps flex mt-8 font-t5 content-between pointer"
            style="width: 100px; margin-top: 4px"
          >
            <p
              @click="setStep(-1)"
              style="width: 50px"
              title="Ctrl/Command + Z"
              :class="{
                disable: actionIndex <= 0,
              }"
            >
              <icon-undo />
            </p>
            <p
              @click="setStep(1)"
              style="width: 50px"
              title="Ctrl/Command + Shift + Z"
              :class="{
                disable: actionIndex > actions.length - 1,
              }"
            >
              <icon-redo />
            </p>
          </div>
          <h1 class="mt-12">导出OSU</h1>
          <a-button @click="exportOSU" class="mt-8">Export</a-button>
        </div>
        <div class="score col-flex content-center h-full" v-show="isPreviewing">
          <h1 class="font-t3">{{ "击打数量" }}</h1>
          <h1 class="font-t8 color-gray">
            {{ "使用键盘1, 2, 3, 4" }}
          </h1>
          <h1 class="font-t5">{{ score }}</h1>
        </div>
      </section>
      <section class="operation col-flex">
        <div class="flex content-end relative">
          <div
            class="track-container left"
            ref="timeLine"
            @scroll="handleScroll"
          >
            <section class="ruler-track flex">
              <div class="line color-000 col-flex content-end" :style="{}">
                <p v-for="t in timeList" :id="t" :key="t">{{ t }}</p>
              </div>
              <section
                class="tracks flex items-end"
                :style="{
                  maxHeight: `${stackHeight + 576}px`,
                }"
              >
                <div
                  class="track relative"
                  v-for="line of stackInfo.stacks"
                  :class="{
                    clicked: clickedTrack === `${line}`,
                  }"
                  :key="line"
                  :style="{
                    height: `${stackHeight}px`,
                  }"
                >
                  <div
                    class="note absolute flex content-between color-fff items-center pointer"
                    v-for="item in originNotes.filter((_) => {
                      const targetMap = stackInfo.map;
                      return _[0] === `${targetMap[line - 1]}`;
                    })"
                    :class="{
                      selected: selectedNote === item,
                      'show-line': showLine,
                      played: isPreviewing && item.played,
                    }"
                    :key="`${item[2]}${item[0]}`"
                    @mouseenter="selectedNote = item"
                    :style="{
                      bottom: `${Number(item[2]) / 5 - 15}px`,
                    }"
                    :id="selectedNote === item ? 'selectedNote' : ''"
                  >
                    <a-button
                      size="mini"
                      type="text"
                      shape="round" 
                      @click="handleChangeNote(0, 0, true)"
                      v-show="selectedNote === item && !isPlaying"
                    >
                      <template #icon>
                        <icon-close-circle />
                      </template>
                    </a-button>
                    <a-button
                      size="mini"
                      type="text"
                      shape="round"
                      @mousedown="handleDragStart"
                      class="mover"
                      v-show="selectedNote === item && !isPlaying"
                    >
                      <template #icon>
                        <icon-drag-arrow />
                      </template>
                    </a-button>
                  </div>
                </div>
              </section>
            </section>
            <div class="progress-line absolute"></div>
          </div>
          <section class="right-scroll">
            <scroll-bar
              :progress="progress"
              @change="play"
              @dragStart="pause"
              v-if="instance.loaded"
              :music="node"
            />
          </section>
        </div>
        <div class="music-play flex content-between items-center">
          <a-tooltip content="当前音符/应该添加音符数">
            <p class="color-000">{{ notesProgress }}</p>
          </a-tooltip>
          <p class="font-t6 color-000 overflow-dot" style="max-width: 50%">
            {{ musicInfo.name }}
          </p>
          <div
            @click="playMusic"
            class="pointer"
            style="width: 20px; height: 20px"
            title="Space"
          >
            <icon-pause v-show="isPlaying" />
            <icon-play-arrow-fill v-show="!isPlaying" />
          </div>
        </div>
      </section>
    </div>
    <div class="text-center mt-16" v-else>
      <p>
        请选择一个 .mp3 文件
      </p>
      <a target="_blank" href="https://qbfao5655g.feishu.cn/docx/BPHpdpjg3oKSzkx9FmmcakstnFd">使用教程</a>
    </div>
  </div>
</template>

<script>
import { getMusicInstance } from "@/common/utils/audio-instance";
import downloadString from "@/common/utils/download";

import MuButton from "@/common/components/mu-button.vue";

import { range, timeToString } from "./components/scroll-bar/utils";
import ScrollBar from "./components/scroll-bar";
import { getUserEditBpm } from "./utils";

let previewTimeout;

const stackMaps = {
  3: {
    stacks: 3,
    step: 170,
    map: [10, 180, 350],
  },
  4: {
    stacks: 4,
    step: 128,
    map: [98, 226, 354, 482],
  },
};

export default {
  name: "osu-editor",
  components: {
    ScrollBar,
    MuButton,
  },
  props: ["musicInfo", "isPreviewing", "slicedMusicInfo"],
  data() {
    // const { type, file } = this.musicInfo;
    // const { slicedMusicInfo } = this;
    // const isCustom = type !== "default";

    return {
      instance: {},
      isSettingProgress: false,
      progress: 0,
      stackHeight: 0,
      timeList: [],
      isPlaying: false,
      playRate: 1,
      selectedTimeMode: 0,

      // 标记滑块
      stackInfo: stackMaps[3],
      selectedNote: [],
      showLine: false,
      ignoreScroll: false,
      originNotes: [],
      addNoteTemplate: [],
      fullDataArr: [],
      osuFileHeader: [],

      // 操作记录
      actions: [],
      actionIndex: 0,

      // 数字记录
      needBeatsNum: 0,

      // 试玩bpm记录
      clickedTrack: 0,
      playAction: undefined,
      score: 0,
    };
  },
  methods: {
    exportOSU() {
      const { originNotes, osuFileHeader, needBeatsNum }= this
      const nextOsuTime = originNotes
        .filter((_) => _[0] !== "0")
        .sort((a, b) => Number(a[2]) - Number(b[2]));
      if (needBeatsNum - needBeatsNum.length > 0) {
        this.$notification.warning('未添加全部音符')
      }
      const nextOSU = [...osuFileHeader, ...nextOsuTime].join("\n");
      downloadString(`${this.musicInfo.name}.osu`, nextOSU)
    },
    setProgress() {
      const { node } = this.instance;
      if (!this.isPlaying || !node) return;
      const curTime = node.currentTime;
      const endTime = node.duration;
      if (this.isPreviewing && this.playAction) this.handlePlayAction();
      this.progress = curTime / endTime;
      if (curTime < endTime) {
        curTime < endTime
          ? requestAnimationFrame(this.setProgress)
          : (this.progress = 0);
      } else {
        this.isPlaying = false;
      }
    },
    // tools
    setTimeMode(v) {
      if (this.selectedTimeMode === v) return;
      this.$emit("handleChangeMode", v);
    },
    setPlayRate(v) {
      this.playRate = v;
      this.node.playbackRate = v;
    },
    handlePlayAction() {
      const { originNotes } = this;
      const [stack, time] = this.playAction;
      const nearNote = originNotes.find((_) => {
        return stack === _[0] && Math.abs(_[2] - time) <= 200 && !_.played;
      });
      if (nearNote) {
        nearNote.played = true;
        this.score++;
        this.playAction = undefined;
      }
    },
    handleScroll(e) {
      if (this.ignoreScroll) {
        this.ignoreScroll = false;
        e.preventDefault();
        return;
      }
      const { node } = this;
      const { scrollHeight, scrollTop } = e.target;
      const time = Math.max((scrollHeight - scrollTop - 576) / 200, 0);
      node.currentTime = time;
      // console.log(time, node.currentTime, scrollHeight - scrollTop - 576);
      const curTime = node.currentTime;
      const endTime = node.duration;
      this.progress = curTime / endTime;
    },
    findNearNote(note) {
      const { originNotes } = this;
      const stack = note[0],
        time = note[2];
      return originNotes.find((_) => {
        return stack !== _[0] && Math.abs(_[2] - time) <= 30;
      });
    },
    handleDragStart(e) {
      const t = document.getElementById('selectedNote');
      console.log(t);
      let startY = e.clientY - t.offsetTop;
      let startX = e.clientX - t.offsetLeft;
      let top, left;

      document.onmousemove = (e) => {
        top = Math.max(e.clientY - startY, 0);
        top = Math.min(top, this.stackHeight - 32);
        left = e.clientX - startX;
        t.style.top = `${top}px`;
        t.style.left = `${left}px`;
      };

      document.onmouseup = () => {
        if (top) {
          const bottom = this.stackHeight - top - 32;
          this.handleChangeNote(bottom, left, false);
          t.style.left = `0px`;
        }

        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
    saveAction(action) {
      this.actions = this.actions.slice(0, this.actionIndex);
      this.actions.push(action);
      this.actionIndex++;
    },
    handleChangeNote(bottom, left, isDelete) {
      const {
        originNotes,
        selectedNote,
        stackInfo: { step },
      } = this;
      let t = left > 40 ? 1 : left < -40 ? -1 : 0;
      const copy = [...selectedNote];
      const notesCopy = [...originNotes];
      const originStack = selectedNote[0];
      const nextStack = Number(originStack) + t * step;

      const i = notesCopy.findIndex((_) => _ === this.selectedNote);

      copy[0] = isDelete
        ? "0"
        : `${nextStack < 0 || nextStack > 490 ? originStack : nextStack}`;
      copy[2] = isDelete ? copy[2] : `${(bottom * 5 + 80).toFixed(0)}`;

      // 寻找挨得近的音符，设置为时间一致
      if (!isDelete) {
        const nearNote = this.findNearNote(copy);
        if (nearNote) {
          copy[2] = nearNote[2];
          this.showLine = true;
          setTimeout(() => {
            this.showLine = false;
          }, 500);
        }
      }
      notesCopy[i] = copy;
      this.selectedNote = copy;
      // 记录操作
      this.saveAction({
        prev: selectedNote,
        next: copy,
        i,
      });
      this.originNotes = notesCopy;
    },
    pause() {
      this.isPlaying = false;
      const { node } = this.instance;
      node.pause();
    },
    play(t) {
      const { node, loaded } = this.instance;
      if (!loaded) return;
      this.isPlaying = true;
      if (typeof t === "number") node.currentTime = t;
      node.play();
      this.setProgress();
    },

    deleteAllNotes() {
      this.clearAction();
      this.originNotes = [];
    },

    addNote(stack) {
      if (this.canAdd <= 0) return;
      const newNote = [...this.addNoteTemplate];
      const prevNote = [...newNote];
      prevNote[0] = "0";
      newNote[0] = `${
        (stack - 1) * this.stackInfo.step + this.stackInfo.map[0]
      }`;
      setTimeout(() => {
        const { scrollHeight, scrollTop } = this.$refs.timeLine;
        newNote[2] = (scrollHeight - scrollTop - 576) * 5;
        const len = this.originNotes.push(newNote);
        this.saveAction({
          prev: prevNote,
          next: newNote,
          i: len - 1,
        });
      }, 10);
    },
    setStep(type) {
      const { actions, actionIndex, isPlaying } = this;
      if (isPlaying) {
        this.$message.warning("Please Pause The Music");
        return;
      }

      if (type === -1 && actionIndex === 0) return;
      if (type === 1 && actionIndex > actions.length - 1) return;

      const {
        i,
        prev,
        next,
        // type: t,
      } = actions[actionIndex - (type === -1 ? 1 : 0)];

      this.originNotes[i] = type === -1 ? prev : next;
      this.selectedNote = this.originNotes[i];
      this.actionIndex += type;
      this.$forceUpdate();
    },
    playMusic() {
      this.isPlaying ? this.pause() : this.play();
    },
    renderTimeLine() {
      const { duration } = this.instance.node;
      const timeList = range(0, duration, 2)
        .map((_) => timeToString(_).split(".")[0])
        .reverse();
      this.timeList = timeList;
      setTimeout(() => {
        const { timeLine } = this.$refs;
        timeLine?.scrollTo({ top: timeLine.scrollHeight });
      }, 500);
    },
    parseOSU(osu) {
      const fullDataArr = osu.split(/\n/).join("\\n").split("\\n");
      this.osuFileHeader = fullDataArr.slice(
        0,
        fullDataArr.indexOf("[HitObjects]") + 1
      );
      const blocks = fullDataArr
        .filter((_) => /^\d.+\.wav/.test(_))
        .map((_) => _.split(","))
        .filter((_) => Number(_[2]) / 5 - 15 < this.stackHeight);
      this.fullDataArr = fullDataArr;
      this.addNoteTemplate = [...blocks[0]];
      this.originNotes = blocks;
      this.formatNotes();
    },
    formatNotes() {
      const {
        originNotes,
        stackInfo: { map },
      } = this;
      if (!map.includes(Number(originNotes[0][0]))) {
        // 发现音轨和音符数目不匹配
        this.originNotes = originNotes.map((_) => {
          const map = {
            10: 98,
            180: 226,
            350: 354,
          };
          const nextStack = `${map[_[0]]}`;
          return [nextStack, ..._.slice(1)];
        });
      }
    },

    handlePreviewKeyPress(key) {
      const k = this.stackInfo.map[key - 1];
      if (!k) return;

      this.clickedTrack = key;
      this.playAction = [`${k}`, this.instance.node.currentTime * 1000];
      setTimeout(() => {
        this.clickedTrack = 0;
      }, 100);
    },
    handleKeyPress(e) {
      const { code, key, metaKey, shiftKey, ctrlKey } = e;
      if (this.isPreviewing) {
        this.handlePreviewKeyPress(key);
        return;
      }
      if (code === "Space") {
        e.preventDefault();
        this.playMusic();
      }
      const s = new Array(this.stackInfo.stacks)
        .fill(0)
        .map((_, i) => `${i + 1}`);
      if (s.includes(key)) {
        this.addNote(Number(key));
      }

      if ((metaKey || ctrlKey) && key === "z") {
        !shiftKey ? this.setStep(-1) : this.setStep(1);
      }
    },
    clearAction() {
      this.actions = [];
      this.actionIndex = 0;
    },
    handleUsePrev() {
      this.$emit("handleUsePrev");
      this.clearAction();
    },
  },
  computed: {
    node() {
      return this.instance.node;
    },
    notesProgress() {
      const { node, originNotes, needBeatsNum, progress } = this;
      const currentNotes = originNotes.filter(
        (_) => _[0] !== "0" && Number(_[2]) / 1000 <= node.currentTime
      );
      // node不会触发computed更新
      return (
        `${progress}` &&
        `${currentNotes.length} / ${Math.round(
          (node.currentTime / node.duration) * needBeatsNum
        )}`
      );
    },
    canAdd() {
      const { needBeatsNum, originNotes } = this;
      return (
        needBeatsNum - originNotes.filter((_) => _[0] !== "0" && _[3]).length
      );
    },
  },
  watch: {
    "instance.loaded": {
      handler(v) {
        // 每秒200px的高度
        this.stackHeight = this.node.duration * 200;
        v && this.renderTimeLine();

        // 解析osu
        const {
          instance: { node },
          musicInfo: { grade, bpm },
        } = this;
        this.needBeatsNum = getUserEditBpm(node.duration, grade, bpm);
        const { keys_num, osu } = this.musicInfo;
        this.stackInfo = stackMaps[keys_num];
        this.parseOSU(osu);
      },
      deep: true,
    },
    isPreviewing(v) {
      if (v) {
        clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => {
          this.play(0);
        }, 3000);
      } else {
        this.pause();
        this.score = 0;
        this.originNotes.forEach((_) => (_.played = false));
      }
    },
    progress() {
      const { timeLine } = this.$refs;
      const { currentTime } = this.node;
      this.ignoreScroll = true;
      timeLine.scrollTo({
        top: timeLine.scrollHeight - 576 - currentTime * 200,
      });
    },
  },
  async mounted() {
    if (!this.musicInfo) return;
    this.instance = await getMusicInstance(this.musicInfo.file);
    // document.getElementById('app').appendChild(this.instance.node)
    document.addEventListener("keydown", this.handleKeyPress);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleKeyPress);
    this.instance?.destroy();
  },
};
</script>

<style lang="less" scoped>
.osu-editor {
  --track-height: 576px;

  height: 638px;
  width: 848px;
  border-radius: 16px;
  border: 1px solid var(--color-gray-900);
  border-bottom-width: 4px;
  background-color: var(--color-gray-200);
  overflow-y: hidden;
  user-select: none;

  .add-note {
    min-width: 3rem;
    border-radius: 1rem;
    margin-right: 0.5rem;
  }

  .mt-10 {
    margin-top: 10px;
  }

  .tools {
    width: 298px;
    height: 100%;
    overflow: scroll;
    padding-left: 24px;
    padding-top: 16px;

    .count {
      bottom: 80px;
      left: 110px;
    }

    .play-rate {
      .highlight {
        color: var(--color-gray-900);
      }
    }

    .steps {
      .disable {
        color: var(--color-gray-500);
      }
    }
  }

  .operation {
    width: 550px;

    .left {
      height: var(--track-height);

      #ruler {
        width: 96px;
      }
    }

    .track-container {
      height: var(--track-height);
      overflow-y: scroll;
    }

    .ruler-track {
      overflow-y: hidden;
      align-items: stretch;
      border-left: 1px solid var(--color-gray-900);

      .line {
        width: 96px;
        text-align: right;
        padding-right: 8px;

        p {
          margin-top: 380px;
          line-height: 20px;

          &:first-child {
            margin-top: 0;
          }

          &:last-child {
            margin-bottom: 24px;
          }
        }
      }
    }

    .tracks {
      width: 360px;
      background-color: var(--color-gray-300);
      border: 1px solid var(--color-gray-900);
      border-top: none;
      border-bottom: none;

      .track {
        &.clicked {
          background-color: var(--color-primary);
        }
        &::before {
          content: "";
          position: absolute;
          box-sizing: content-box;
          width: 100%;
          border-right: 1px dashed var(--color-gray-500);
          height: calc(var(--track-height) - 24px);
          top: -552px;
        }

        box-sizing: border-box;
        background-color: var(--color-yellow);
        margin-top: calc(var(--track-height) - 24px);
        margin-bottom: 24px;
        flex: 1;
        border-right: 1px solid var(--color-gray-900);

        &:last-child {
          border-right: none;

          &::before {
            border: none;
          }
        }

        .note {
          height: 8px;
          width: calc(100% - 50px);
          background-color: #000;
          border-radius: 24px;
          margin: 0 12px;
          padding: 12px;
          z-index: 99;

          &.selected.show-line {
            &::before {
              content: "";
              position: absolute;
              top: 50%;
              width: 1000px;
              left: -500px;
              height: 1px;
              z-index: 100;
              background-color: var(--color-red);
            }
          }
          &.played {
            background-color: var(--color-green);
          }
        }
      }
    }

    .progress-line {
      height: 4px;
      width: calc(100% - 192px);
      z-index: 100;
      background-color: var(--color-red);
      bottom: 24px;
      right: 96px;
    }

    .music-play {
      border-color: var(--color-gray-900);
      border-top: 1px solid;
      border-left: 1px solid;
      padding: 0 24px;
      height: 58px;
    }
  }
}
</style>
<style lang="less">
.osu-editor {
  &::-webkit-scrollbar,
  *::-webkit-scrollbar {
    display: none;
  }

  .mu-button {
    margin-left: 0;
  }
}
</style>
