<script setup>
import {computed, onMounted, reactive} from "vue";
import store from "@/store";
import router from "@/router";

const state = reactive({
    password: '',
    newPassword: '',
    newPasswordConfirm: '',
    announce: '',
    announceColor: ''
});

const accessToken = computed(() => store.state.accessToken);

onMounted(() => {
    if (!accessToken.value) {
        alert('로그인이 필요합니다.');
        router.push('/login');
    }
})
function checkPassword() {
    if (state.newPassword.length === 0 || state.newPasswordConfirm.length === 0) {
        state.announce = "";
        return;
    }
    if (state.newPassword === state.newPasswordConfirm) {
        state.announce = "비밀번호 확인이 일치합니다.";
        state.announceColor = "green";
    } else {
        state.announce = "비밀번호 확인이 일치하지 않습니다.";
        state.announceColor = "red";
    }
}
</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column">
            <h1 class="fw-bold mt-5 mb-3 text-center">비밀번호 변경</h1>
            <form >
                <div class="mb-3">
                    <label for="password" class="form-label">비밀번호</label>
                    <input type="password" class="form-control" v-model="state.password" size="30" required/>
                </div>
                <div class="mb-3">
                    <label for="new-password" class="form-label">새 비밀번호</label>
                    <input type="password" class="form-control" v-model="state.newPassword" size="30" @blur="checkPassword" required/>
                </div>
                <div class="mb-3">
                    <label for="new-password-confirm" class="form-label">새 비밀번호 확인</label>
                    <input type="password" class="form-control" v-model="state.newPasswordConfirm" @blur="checkPassword"
                           size="30" required/>
                </div>
                <div class="mb-3 text-warn" id="announce" :style="{color: state.announceColor}">{{
                        state.announce
                    }}
                </div>
                <div class="mb-3">
                    <input type="submit" id="change-button" value="변경" class="btn btn-info text-white container-fluid">
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>

</style>