<script setup>
import {computed, onMounted, reactive, readonly} from "vue";
import axios from "axios";
import {useRoute} from "vue-router";
import store from "@/store";

const state = reactive({
    post: {},
    user: {}
});
const accessToken = computed(() => store.state.accessToken);

const route = useRoute();

onMounted(async () => {
    await axios.get(`/posts/${route.params.id}`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.post = {...response.data, createdAt: response.data.createdAt.replace('T', ' ')}
        }
    }).catch(function (error) {
        console.log(error);
    });

    await axios.get(`/users/me`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.user = readonly(response.data);
        }
    }).catch(function (error) {
        console.log(error);
    });
})
</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column w-50">
            <h1 class="fw-bold mt-5 mb-3 text-center">여행 정보 공유</h1>
            <div class="d-flex flex-column">
                <router-link to="/posts" class="text-decoration-none text-info mb-2 fw-bold">게시판 &gt;</router-link>
                <div class="d-flex mb-2">
                        <span v-if="state.post.notice"
                              class="badge text-bg-primary fs-4 mb-3">공지</span>&nbsp;
                    <span class="fs-4">
                        {{ state.post.title }}
                    </span>
                </div>
                <div class="d-flex align-items-center mb-3">
                    <div class="d-flex me-3">
                        <img src="@/assets/img/no-profile-image.png"
                             class="rounded-circle border border-2 border-dark" width="64" height="64" alt="">
                    </div>
                    <div class="d-flex flex-column">
                        <span class="fw-bold">{{ state.post.creatorNickname }}</span>
                        <span class="text-secondary">{{ state.post.createdAt }}&nbsp;조회&nbsp;{{
                            state.post.views
                            }}</span>
                    </div>
                </div>
                <p class="mb-3">{{ state.post.content }}</p>
                <div class="d-flex justify-content-end">
                    <div v-if="state.user.role === 'ADMIN'">
                        <button v-if="state.post.isNotice" id="post-notice-button"
                                class="btn btn-primary me-3 text-white">공지 해제
                        </button>
                        <button v-else id="post-notice-button" class="btn btn-primary me-3 text-white">공지 설정</button>
                    </div>
                    <div v-if="state.user.id === state.post.creatorId">
                        <router-link id="post-update-button" class="btn btn-warning me-3 text-white"
                                     :to="`/posts/${state.post.id}/modify`">수정
                        </router-link>
                        <button id="post-delete-button" class="btn btn-danger">삭제</button>
                    </div>
                </div>
                <div class="d-flex">
                    <a href="#" id="like" class="text-decoration-none text-danger">
                        <svg v-if="state.post.isLiked" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                             fill="currentColor"
                             class="bi bi-heart-fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd"
                                  d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"></path>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             class="bi bi-heart" viewBox="0 0 16 16">
                            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>