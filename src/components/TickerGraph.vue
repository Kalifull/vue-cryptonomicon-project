<template>
  <section v-if="selectedTicker && !tickersInvalid.includes(selectedTicker.name)" class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ selectedTicker.name }} - USD
    </h3>
    <div ref="graph" class="flex items-end border-gray-600 border-b border-l h-64">
      <div
        v-for="(bar, index) of normalizedGraph"
        :key="index"
        class="bg-purple-800 border w-10"
        :style="{ height: `${bar}%` }"
      ></div>
    </div>

    <button type="button" class="absolute top-0 right-0" @click="onCloseButtonClick">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:svgjs="http://svgjs.com/svgjs"
        version="1.1"
        width="30"
        height="30"
        x="0"
        y="0"
        viewBox="0 0 511.76 511.76"
        style="enable-background: new 0 0 512 512"
        xml:space="preserve"
      >
        <g>
          <path
            d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
            fill="#718096"
            data-original="#000000"
          ></path>
        </g>
      </svg>
    </button>
  </section>
  <div
    v-else-if="selectedTicker && tickersInvalid.includes(selectedTicker.name)"
    class="flex justify-center text-lg leading-6 font-medium text-gray-900 my-8"
  >
    Конвертация из {{ selectedTicker.name }} в USD не возможна для данного тикера
  </div>
</template>

<script>
export default {
  props: {
    validUpdateTicker: {
      type: Boolean,
      required: false,
    },
    selectedTicker: {
      type: Object,
      required: false,
    },
    tickersInvalid: {
      type: Array,
      required: false,
    },
  },

  emits: ['close'],

  data() {
    return {
      graph: [],
      maxGraphElements: 1,
    };
  },

  computed: {
    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }

      return this.graph.map((price) => 5 + ((price - minValue) * 95) / (maxValue - minValue));
    },
  },

  watch: {
    selectedTicker() {
      this.graph = [];
      this.$nextTick().then(this.calculateMAxGraphElements);
    },

    'selectedTicker.price': {
      handler(newValue) {
        if (this.validUpdateTicker) {
          this.graph.push(newValue);
          while (this.graph.length > this.maxGraphElements) {
            this.graph.shift();
          }
        }
      },
      deep: true,
    },
  },

  mounted() {
    window.addEventListener('resize', this.calculateMAxGraphElements);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.calculateMAxGraphElements);
  },

  methods: {
    onCloseButtonClick() {
      this.$emit('close', null);
    },

    calculateMAxGraphElements() {
      if (!this.$refs.graph) {
        return;
      }

      this.maxGraphElements = this.$refs.graph.clientWidth / 38;
    },
  },
};
</script>
