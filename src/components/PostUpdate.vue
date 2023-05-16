<script setup>
import {computed, onMounted, reactive, readonly} from "vue";
import axios from "axios";
import {useRoute} from "vue-router";
import store from "@/store";
import router from "@/router";

const state = reactive({
    post: {}
});

const route = useRoute();
const accessToken = computed(() => store.state.accessToken);

onMounted(async () => {
    if(!accessToken.value) {
        alert('로그인이 필요합니다.');
        await router.push('/login');
        return;
    }
    await axios.get(`/posts/${route.params.id}`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.post = response.data;
        }
    }).catch(function (error) {
        console.log(error);
    });
});

async function updatePost(event) {
    event.preventDefault();
    await axios.put(`/posts/${route.params.id}`, {
        id: state.post.id,
        title: state.post.title,
        content: state.post.content
    }, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            router.push(`/posts/${route.params.id}`);
        }
    }).catch(function (error) {
        alert('게시글 수정에 실패했습니다.');
        console.log(error);
    });
}

</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column w-50">
            <h1 class="fw-bold mt-5 mb-3 text-center">여행 정보 공유</h1>
            <div class="d-flex flex-column">
                <form @submit="updatePost">
                    <div class="mb-3">
                        <label for="title" class="form-label">제목</label>
                        <input type="text" class="form-control" v-model="state.post.title">
                    </div>
                    <div class="mb-3">
                        <label for="content" class="form-label">내용</label>
                        <textarea class="form-control" rows="5" v-model="state.post.content"></textarea>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button type="submit" class="btn btn-info text-white">수정</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>