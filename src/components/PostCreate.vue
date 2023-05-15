<script setup>
import {computed, reactive} from "vue";
import axios from "axios";
import store from "@/store";
import router from "@/router";

const state = reactive({
    title: '',
    content: ''
});

const accessToken = computed(() => store.state.accessToken);

async function write(event) {
    event.preventDefault();
    await axios.post('/posts', {
        title: state.title,
        content: state.content
    }, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }).then(function (response) {
        if (response.status === 201) {
            router.push('/posts');
        }
    }).catch(function (error) {
        alert("게시글 작성에 실패했습니다.");
        console.log(error);
    });
}
</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column w-50">
            <h1 class="fw-bold mt-5 mb-3 text-center">여행 정보 공유</h1>
            <div class="d-flex flex-column">
                <form @submit="write">
                    <div class="mb-3">
                        <label for="title" class="form-label">제목</label>
                        <input type="text" class="form-control" v-model="state.title">
                    </div>
                    <div class="mb-3">
                        <label for="content" class="form-label">내용</label>
                        <textarea class="form-control" v-model="state.content" rows="5"></textarea>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button type="submit" class="btn btn-info text-white">등록</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>