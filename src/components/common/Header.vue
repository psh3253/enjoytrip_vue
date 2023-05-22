<script setup>
import {useStore} from "vuex";
import {computed, onMounted, reactive} from "vue";
import axios from "axios";
import router from "@/router";

const state = reactive({
    user: {}
})

const store = useStore();
const accessToken = computed(() => store.state.accessToken);

onMounted(async () => {
    if (accessToken.value) {
        await axios.get('/users/me', {}).then(function (response) {
            if (response.status === 200) {
                state.user = response.data;
            }
        }).catch(function (error) {
            console.log(error);
        });
    }
});

function logout() {
    store.commit('logout');
    router.push('/');
}
</script>

<template>
    <header>
        <nav class="navbar navbar-expand-lg bg-info bg-opacity-75" data-bs-theme="dark">
            <div class="container-fluid">
                <router-link class="navbar-brand" to="/">
                    <h3 class="text-white fw-bold">EnjoyTrip</h3>
                </router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <router-link class="nav-link text-white fw-bold" to="/tour-info">지역별관광지</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link text-white fw-bold" to="/hot-places">핫플레이스</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link text-white fw-bold" to="/posts">게시판</router-link>
                        </li>
                    </ul>
                    <div v-if="accessToken == null">
                        <router-link class="btn btn-info me-3 text-white fw-bold" to="/login">로그인</router-link>
                        <router-link class="btn btn-info text-white fw-bold" to="/join">회원가입</router-link>
                    </div>
                    <div v-else>
                        <router-link class="btn btn-info me-3 text-white fw-bold" :to="`/users/${state.user.id}`">
                            마이페이지
                        </router-link>
                        <button class="btn btn-info text-white fw-bold" @click="logout">로그아웃</button>
                    </div>
                </div>
            </div>
        </nav>
    </header>
</template>

<style scoped>

</style>