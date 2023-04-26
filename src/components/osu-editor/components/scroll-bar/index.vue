<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="scroll-bar-container relative">
    <div ref="scrollBgC" class="scroll-bar relative">
      <canvas
        class="canvas"
        ref="scrollBg"
        :width="96"
        :height="canvasHeight"
      />
    </div>
    <div
      class="block absolute row-resizer"
      ref="block"
      @mousedown="handleDragStart"
    ></div>
  </div>
</template>

<script>
import { drawScrollBar } from "./utils";

export default {
  name: "scroll-bar",
  props: {
    music: {
      type: HTMLAudioElement,
    },
    progress: {
      type: Number,
    },
  },
  data() {
    return {
      drag: false,
      offsetTop: 0,
      barHeight: 576,
    };
  },
  methods: {
    handleDragStart(e) {
      const t = e.target;
      this.drag = true;
      this.startY = e.clientY - t.offsetTop;
      this.$emit("dragStart");
      const { barHeight } = this;
      let top;
      document.onmousemove = (e) => {
        top = Math.max(e.clientY - this.startY, 0);
        top = Math.min(top, barHeight - 30);
        const bgScrollScale = top / (barHeight - 30);
        const nextScrollTop = (this.canvasHeight - barHeight) * bgScrollScale;

        console.log(nextScrollTop, this.canvasHeight);
        this.$refs.scrollBgC.scrollTo({
          top: nextScrollTop,
        });
        this.offsetTop = top;
        t.style.top = `${top}px`;
      };

      document.onmouseup = () => {
        if (this.drag) {
          console.log(top, this.music.duration);
          const nextTime = (1 - top / (barHeight - 30)) * this.music.duration;
          this.$emit("change", nextTime);
          this.drag = false;
        }
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
  },
  computed: {
    canvasHeight() {
      return this.music.duration * 15 + 10;
    },
  },
  watch: {
    progress(v) {
      const { currentTime } = this.music;
      const { barHeight } = this;
      const blockTop = (1 - v) * (barHeight - 30);
      this.$refs.block.style.top = `${blockTop}px`;
      this.$refs.scrollBgC.scrollTo({
        top: this.canvasHeight - currentTime * 15 - blockTop - 30,
      });
    },
  },
  mounted() {
    const { duration } = this.music;
    drawScrollBar(this.$refs.scrollBg, 2, duration);
    this.barHeight = Math.min(this.barHeight, this.canvasHeight);
    this.$refs.scrollBgC.scrollTo({ top: this.canvasHeight });
  },
};
</script>

<style lang="less" scoped>
.scroll-bar-container {
  .scroll-bar {
    max-height: 576px;
    overflow-y: hidden;

    .canvas {
      width: 96px;
    }
  }

  .block {
    height: 30px;
    width: 100%;
    background-color: var(--color-yellow);
    box-sizing: border-box;
    border-bottom: 3px solid var(--color-red);
    opacity: 0.3;
    bottom: 0;
    will-change: transform;

    &:hover {
      opacity: 0.6;
    }
  }
}
</style>
