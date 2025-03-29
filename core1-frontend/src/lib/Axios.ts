import axios from 'axios';
axios.defaults.withCredentials = true;

const Axios = axios.create({
  baseURL: 'https://core1_backend.chysev.cloud',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default Axios;
