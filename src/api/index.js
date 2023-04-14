const LOAD_CURRENCY_URL = 'https://min-api.cryptocompare.com/data/all/coinlist';
const API_KEY = '384f45c7c6caaad4aa39df8fdac7788aae84d3289fe7b4e38fd6074784cbfacf';

const tickersHandlers = new Map();

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

const AGGREGATE_INDEX = '5';
const INVALID_COIN_TYPE = '500';

export const fetchCoinsList = async () => {
  const response = await fetch(`${LOAD_CURRENCY_URL}?api_key=${API_KEY}`);
  const rawData = await response.json();

  return Object.keys(rawData.Data);
};

socket.addEventListener('message', (event) => {
  let isValid = true;

  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: parameter,
  } = JSON.parse(event.data);

  if (type === INVALID_COIN_TYPE) {
    isValid = false;
    const newPrice = '-';
    const currency = parameter.substring(9, parameter.length - 4);
    const handlers = tickersHandlers.get(currency) || [];
    handlers.forEach((fn) => fn(newPrice, isValid));
  } else if (type !== AGGREGATE_INDEX || !newPrice) {
    return;
  }

  const handlers = tickersHandlers.get(currency) || [];
  handlers.forEach((fn) => fn(newPrice, isValid));
});

const sendToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
};

const subscribeToTickerOnWebSocket = (ticker) => {
  sendToWebSocket({ action: 'SubAdd', subs: [`5~CCCAGG~${ticker}~USD`] });
};

export const subscribeToTicker = (ticker, callback) => {
  const subscribes = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribes, callback]);
  subscribeToTickerOnWebSocket(ticker);
};

const unsubscribeFromTickerOnWebSocket = (ticker) => {
  sendToWebSocket({ action: 'SubRemove', subs: [`5~CCCAGG~${ticker}~USD`] });
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWebSocket(ticker);
};
