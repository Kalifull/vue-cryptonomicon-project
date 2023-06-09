<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="isLoading"
      class="fixed w-100 h-100 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div class="container">
      <add-ticker :tickers="tickers" :coins-list="coinsList" @add-ticker="addTicker" />
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            v-if="page > 1"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="page -= 1"
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="page += 1"
          >
            Вперед
          </button>
          <div>
            <label for="filter" class="block mb-2 text-sm font-medium text-gray-700">Фильтр</label>
            <input
              id="filter"
              v-model="filterTickerName"
              type="text"
              placeholder="Что хотите найти?"
              class="block pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="tick of paginatedTickers"
            :key="tick.name"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
            :class="{ 'border-4': selectedTicker === tick }"
            @click="selectTicker(tick)"
          >
            <div
              class="px-4 py-5 sm:p-6 text-center"
              :class="{ 'bg-red-300': tickersInvalid.includes(tick.name) }"
            >
              <dt class="text-sm font-medium text-gray-500 truncate">{{ tick.name }} - USD</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(tick.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>

            <button
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
              @click.stop="handleDelete(tick)"
            >
              Удалить
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <ticker-graph
        :valid-update-ticker="validUpdateTicker"
        :selected-ticker="selectedTicker"
        :tickers-invalid="tickersInvalid"
        @close="handleClose"
      />
    </div>
  </div>
</template>

<script>
import { fetchCoinsList, subscribeToTicker, unsubscribeFromTicker } from './api';

import AddTicker from './components/AddTicker.vue';
import TickerGraph from './components/TickerGraph.vue';

export default {
  name: 'App',

  components: {
    AddTicker,
    TickerGraph,
  },

  data() {
    return {
      tickers: [],
      tickersInvalid: [],
      selectedTicker: null,
      filterTickerName: '',
      validUpdateTicker: true,

      page: 1,

      coinsList: [],
      isLoadingCoinsList: true,
    };
  },

  computed: {
    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.toLowerCase().includes(this.filterTickerName.toLowerCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    isLoading() {
      return this.isLoadingCoinsList;
    },

    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    pageStateOptions() {
      return {
        filter: this.filterTickerName,
        page: this.page,
      };
    },
  },

  watch: {
    filterTickerName() {
      this.page = 1;
    },

    pageStateOptions({ filter, page }) {
      const { pathname } = window.location;
      window.history.pushState(null, document.title, `${pathname}?filter=${filter}&page=${page}`);
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    tickers() {
      localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
    },
  },

  created() {
    const { filter, page } = Object.fromEntries(new URL(window.location).searchParams.entries());

    if (filter) {
      this.filterTickerName = filter;
    }

    if (page) {
      this.page = page;
    }

    const tickersData = localStorage.getItem('cryptonomicon-list');

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice, isValid) =>
          this.updateTicker(ticker.name, newPrice, isValid)
        );
      });
    }
  },

  mounted() {
    this.loadCryptoCurrencyList();
  },

  methods: {
    addTicker(ticker) {
      const currentTicker = { name: ticker, price: '-' };
      this.tickers = [...this.tickers, currentTicker];
      this.filterTickerName = '';

      subscribeToTicker(currentTicker.name, (newPrice, isValid) =>
        this.updateTicker(currentTicker.name, newPrice, isValid)
      );
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((ticker) => ticker !== tickerToRemove);

      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }

      unsubscribeFromTicker(tickerToRemove.name);
    },

    handleClose() {
      this.selectedTicker = null;
    },

    formatPrice(normalizedPrice) {
      if (normalizedPrice === '-') {
        return normalizedPrice;
      }

      return normalizedPrice > 1 ? normalizedPrice.toFixed(2) : normalizedPrice.toPrecision(2);
    },

    updateTicker(tickerName, price, isValid) {
      this.tickers
        .filter(({ name }) => name === tickerName)
        .forEach((ticker) => {
          if (ticker === this.selectedTicker && isValid) {
            this.validUpdateTicker = true;
          }

          if (!isValid) {
            this.validUpdateTicker = false;
            this.tickersInvalid.push(tickerName);
          }

          ticker.price = price;
        });
    },

    async loadCryptoCurrencyList() {
      this.coinsList = await fetchCoinsList();
      this.isLoadingCoinsList = false;
    },

    selectTicker(ticker) {
      this.selectedTicker = ticker;
    },
  },
};
</script>
