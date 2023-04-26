<template>
  <button
    :class="`mu-button flex items-center content-center ${buttonStyle} ${size}`"
    @click="click"
    :disabled="disabled"
    :loading="loading"
  >
    <slot />
  </button>
</template>

<script>
/**
 * size: S: 50px, M: 60px, L: 64px
 * buttonStyle: primary black white transparent transparent-white
 */
export default {
  name: "mu-button",
  props: {
    size: {
      type: String,
      default() {
        return "L";
      },
    },
    buttonStyle: {
      type: String,
      default() {
        return "primary";
      },
    },
    disabled: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
  },
  methods: {
    click() {
      this.$emit("click");
    },
  },
};
</script>

<style lang="less">
.mu-button {
  border-radius: 0.625rem;
  font-size: 1.25rem;
  border: none;
  padding: 0 1rem;
  border-radius: 10px !important;

  &.el-button {
    background-color: transparent;
    border: none;
    &:hover,
    &:active {
      color: #000;
    }
  }

  &.L {
    padding: 0 2.5rem;
    min-height: 4rem;
    font-size: 1.5rem;
    min-width: 200px;
  }

  &.S {
    min-height: 3.125rem;
    font-size: 1.25rem;
    min-width: 160px;
  }

  &.XS {
    height: 2rem;
    font-size: 1rem;
    min-width: 6rem;
    border-radius: 24px;
  }

  &.M {
    padding: 0 1.8rem;
    height: 3.75rem;
    font-size: 1.25rem;
    min-width: 180px;
  }

  &.transparent,
  &.white {
    border: 1px solid var(--color-gray-900);
    &:hover {
      color: #000;
      background-color: transparent;
    }
  }

  &.transparent-white {
    background: transparent;
    border: 1px solid var(--color-gray-200);
    color: var(--color-gray-200);
  }

  &.primary,
  &.white,
  &.transparent {
    color: var(--color-gray-900);
  }

  &.primary {
    background-color: var(--color-primary);
  }

  &.black {
    color: var(--color-gray-200);
    background-color: var(--color-gray-900);

    &.is-disabled {
      color: var(--color-gray-500);
      background-color: var(--color-gray-900);
    }
  }

  &.white {
    background-color: var(--color-gray-200);
  }
}

@media (max-width: 768px) {
  .mu-button;
}
</style>
