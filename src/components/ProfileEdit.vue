<script setup>
import {computed, onMounted, reactive} from "vue";
import axios from "axios";
import store from "@/store";

const state = reactive({
    user: {}
})

const accessToken = computed(() => store.state.accessToken);

onMounted(async () => {
    if(accessToken.value === null) {
        alert('로그인 후 이용해주세요.');
        await router.push('/login');
        return;
    }

    await axios.get('/users/me', {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then((response) => {
        if (response.status === 200) {
            state.user = response.data;
        }
    }).catch((error) => {
        console.log(error);
    })
});

async function withdraw() {

}
</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column">
            <h1 class="fw-bold mt-5 mb-3 text-center">프로필 수정</h1>
            <form>
                <div class="mb-3">
                    <label for="nickname" class="form-label">닉네임</label>
                    <input type="text" class="form-control" v-model="state.user.nickname" size="30" required/>
                </div>
                <div class="mb-3">
                    <input type="submit" value="수정"
                           class="btn btn-info text-white container-fluid">
                </div>
                <div class="mb-3">
                    <button class="btn btn-danger container-fluid">탈퇴하기</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>

</style>