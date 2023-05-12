<script setup>
import {reactive} from "vue";
import axios from "axios";
import router from "@/router";

const state = reactive({
    email: '',
    password: '',
    password_confirm: '',
    nickname: '',
    announce: '',
    announceColor: ''
});

function checkPassword() {
    if (state.password.length === 0 || state.password_confirm.length === 0) {
        state.announce = "";
        return;
    }
    if (state.password === state.password_confirm) {
        state.announce = "비밀번호가 일치합니다.";
        state.announceColor = "green";
    } else {
        state.announce = "비밀번호가 일치하지 않습니다.";
        state.announceColor = "red";
    }
}

async function join(event) {
    event.preventDefault();
    if (state.password.length === 0 || state.password_confirm.length === 0) {
        alert("비밀번호를 입력해주세요.");
        return;
    }
    if (state.password !== state.password_confirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }
    await axios.post('/users/join', {
        email: event.target.email.value,
        password: event.target.password.value,
        nickname: event.target.nickname.value
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }).then((response) => {
            if (response.status === 201) {
                router.push('/');
            }
        }
    ).catch((error) => {
        if (error.response.status === 409) {
            alert("이미 존재하는 이메일입니다.");
        } else {
            alert("회원가입에 실패했습니다.");
        }
    });
}
</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column">
            <h1 class="fw-bold mt-5 mb-3 text-center">회원가입</h1>
            <form @submit="join">
                <div class="mb-3">
                    <label for="email" class="form-label">이메일</label>
                    <input type="email" class="form-control" id="email" v-model="state.email" size="30" required/>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">비밀번호</label>
                    <input type="password" class="form-control" id="password" v-model="state.password"
                           size="30"
                           @blur="checkPassword" required/>
                </div>
                <div class="mb-3">
                    <label for="password-confirm" class="form-label">비밀번호 확인</label>
                    <input type="password" class="form-control" id="password-confirm"
                           v-model="state.password_confirm" size="30" @blur="checkPassword"
                           required/>
                </div>
                <div class="mb-3 text-warn" id="announce" :style="{color: state.announceColor}">{{
                    state.announce
                    }}
                </div>
                <div class="mb-3">
                    <label for="nickname" class="form-label">닉네임</label>
                    <input type="text" class="form-control" id="nickname" name="nickname" size="30"
                           v-model="state.nickname" required/>
                </div>
                <div class="mb-3">
                    <input type="submit" value="가입"
                           class="btn btn-info text-white container-fluid">
                </div>
                <div class="mb-3">
                    <router-link id="btn-cancel" class="btn btn-info text-white container-fluid" to="/">
                        취소
                    </router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>

</style>