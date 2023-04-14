<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block mb-2 text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            id="wallet"
            v-model.trim="ticker"
            required
            type="text"
            name="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например: DOGE"
            @keydown.enter="addTicker"
          />
        </div>

        <div v-if="suitableTickers.length" class="flex bg-white p-1 rounded-md shadow-md flex-wrap">
          <span
            v-for="(suitableTicker, index) of suitableTickers"
            :key="index"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
            @click="autocompleteTicker(suitableTicker)"
          >
            {{ suitableTicker }}
          </span>
        </div>

        <div v-if="isExistsTicker" class="text-sm text-red-600">Такой тикер уже добавлен</div>
      </div>
    </div>

    <add-button
      type="button"
      :disabled="isExistsTicker"
      :class="{ 'opacity-60 cursor-not-allowed': isExistsTicker }"
      @click="addTicker"
    />
  </section>
</template>

<script>
import AddButton from './AddButton.vue';

export default {
  components: {
    AddButton,
  },

  props: {
    coinsList: {
      type: Array,
      required: false,
    },
    tickers: {
      type: Array,
      required: false,
    },
  },

  emits: {
    'add-ticker': (value) => typeof value === 'string' && value.trim().length > 0,
  },

  data() {
    return {
      ticker: '',
      maxAvailableHint: 4,
    };
  },

  computed: {
    isExistsTicker() {
      return this.tickers.find(({ name }) => name.toLowerCase() === this.ticker.toLowerCase());
    },

    suitableTickers() {
      if (!this.ticker || !this.coinsList.length) {
        return [];
      }

      return this.coinsList
        .filter((existingTicker) =>
          existingTicker.toLowerCase().startsWith(this.ticker.toLowerCase())
        )
        .slice(0, this.maxAvailableHint);
    },
  },

  methods: {
    addTicker() {
      if (!this.ticker) {
        return;
      }

      this.$emit('add-ticker', this.ticker);
      this.ticker = '';
    },

    autocompleteTicker(ticker) {
      this.ticker = ticker;

      if (!this.isExistsTicker) {
        this.addTicker();
      }
    },
  },
};
</script>
