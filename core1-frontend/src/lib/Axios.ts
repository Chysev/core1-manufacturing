import axios from 'axios';
axios.defaults.withCredentials = true;

const Axios = axios.create({
  baseURL: 'https://backend-core1.jjm-manufacturing.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default Axios;
