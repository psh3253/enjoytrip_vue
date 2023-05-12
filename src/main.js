import { createApp } from 'vue'
import App from './App.vue'
import store from "./store";
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import router from "@/router";

const app = createApp(App);

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL;
app.config.globalProperties.$bootstrap = require('bootstrap');

app.use(router).use(store).mount('#app');