import { createStore } from "vuex";
export default createStore({
    state: {
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null
    },
    mutations: {
        login(state, tokens) {
            state.accessToken = tokens.accessToken;
            state.refreshToken = tokens.refreshToken;
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
        },
        logout(state) {
            state.accessToken = null;
            state.refreshToken = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }
});