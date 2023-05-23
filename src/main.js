import { createApp } from 'vue'
import App from './App.vue'
import store from "./store";
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import router from "@/router";

const app = createApp(App);

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL;

let isRefreshing = false; // 토큰 재요청 중 여부를 나타내는 플래그 변수
let failedQueue = []; // 실패한 요청을 저장하는 큐

axios.interceptors.request.use((config) => {
    const accessToken = store.state.accessToken;
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            const originalRequest = error.config;

            if (!isRefreshing) {
                isRefreshing = true;

                const refreshToken = store.state.refreshToken;

                if (refreshToken) {
                    try {
                        const response = await axios.post('/users/refresh-token', {
                            refreshToken: refreshToken,
                        }, {
                            headers: {
                                "Content-Type": "application/json"
                            }
                        });
                        const newAccessToken = response.data.accessToken;
                        const newRefreshToken = response.data.refreshToken;

                        store.commit('login', {
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                        });

                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        store.commit('logout');
                        return Promise.reject(error);
                    } finally {
                        isRefreshing = false;
                    }
                } else {
                    store.commit('logout');
                }
            }

            // 토큰 재요청 중인 경우 실패한 요청을 큐에 저장
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                // 토큰을 받아온 후에는 다시 원래 요청을 보냄
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axios(originalRequest);
            }).catch((error) => {
                // 실패한 요청에 대해서도 오류 반환
                return Promise.reject(error);
            });
        }
        return Promise.reject(error);
    }
);

function processQueue(token) {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
}

// 토큰 갱신 완료 후 처리
axios.interceptors.response.use((response) => {
    // 새로운 토큰을 받아온 경우 큐에 저장된 요청들을 처리
    const { config } = response;
    if (config && config.headers && config.headers.Authorization && response.data.accessToken) {
        const token = response.data.accessToken;
        processQueue(token);
    }
    return response;
});

app.config.globalProperties.$bootstrap = require('bootstrap');

app.use(router).use(store).mount('#app');