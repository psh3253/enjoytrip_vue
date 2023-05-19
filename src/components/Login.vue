<script setup>
import axios from "axios";
import store from "@/store";
import router from "@/router";
import {reactive} from "vue";

const state = reactive({
    email: '',
    password: ''
});
async function login(event) {
    event.preventDefault();
    await axios.post('/users/login', {
        email: state.email,
        password: state.password
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }).then((response) => {
        if (response.status === 200) {
            const {accessToken, refreshToken} = response.data;
            store.commit('login', {accessToken: accessToken, refreshToken: refreshToken});
            location.href = '/';
        }
    }).catch((error) => {
        if (error.response.status === 401) {
            alert('비밀번호가 일치하지 않습니다.');
        } else if (error.response.status === 404) {
            alert('존재하지 않는 이메일입니다.');
        } else {
            alert('로그인에 실패했습니다.');
        }
    });
}
</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column">
            <h1 class="fw-bold mt-5 mb-3 text-center">로그인</h1>
            <form @submit="login">
                <div class="mb-3">
                    <label for="email" class="form-label">이메일</label>
                    <input type="email" class="form-control" id="email" size="30" v-model="state.email" required/>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">비밀번호</label>
                    <input type="password" class="form-control" id="password" size="30" v-model="state.password" required/>
                </div>
                <div class="mb-3">
                    <input type="submit" id="btn-login" value="로그인" class="btn btn-info text-white container-fluid">
                </div>
            </form>
            <router-link to="/password-find" class="btn btn-info text-white mb-5"> 비밀번호 찾기</router-link>
        </div>
    </div>
</template>

<style scoped>

</style>