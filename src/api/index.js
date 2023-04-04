const LOAD_CURRENCY_URL = 'https://min-api.cryptocompare.com/data/all/coinlist';
const API_KEY = '5a8c3852e9261ef18e5909d2633b35f84e823c9661d2bcd00f7b398a067bde12';

export const fetchCoinsList = async () => {
  const response = await fetch(`${LOAD_CURRENCY_URL}?api_key=${API_KEY}`);
  const rawData = await response.json();

  return Object.keys(rawData.Data);
};
