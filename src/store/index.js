import { createStore } from "vuex";

export default createStore({
    state: {
        accessToken: null,
        refreshToken: null
    },
    mutations: {
        login(state, tokens) {
            state.accessToken = tokens.accessToken;
            state.refreshToken = tokens.refreshToken;
        },
        logout(state) {
            state.accessToken = null;
            state.refreshToken = null;
        }
    }
});