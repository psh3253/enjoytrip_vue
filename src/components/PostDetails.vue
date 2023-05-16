<script setup>
import {computed, onMounted, reactive, readonly} from "vue";
import axios from "axios";
import {useRoute} from "vue-router";
import store from "@/store";
import router from "@/router";

const state = reactive({
    post: {},
    user: {},
    likeUsers: []
});
const accessToken = computed(() => store.state.accessToken);
const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;

const route = useRoute();

onMounted(async () => {
    if (!accessToken.value) {
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
            state.post = {...response.data, createdAt: response.data.createdAt.substring(0, 19).replace('T', ' ')}
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
    await axios.get(`/posts/${route.params.id}/like`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.likeUsers = response.data.map(user => {
                let now = new Date();
                if (now.getFullYear() === new Date(user.createdAt).getFullYear() &&
                    now.getMonth() === new Date(user.createdAt).getMonth() &&
                    now.getDate() === new Date(user.createdAt).getDate()
                ) {
                    return {
                        ...user,
                        createdAt: user.createdAt.substring(11, 16)
                    };
                } else {
                    return {
                        ...user,
                        createdAt: user.createdAt.substring(0, 10)
                    };
                }
            });
        }
    }).catch(function (error) {
        console.log(error);
    });
});

async function deletePost() {
    if (!confirm('게시글을 삭제하시겠습니까?')) {
        return;
    }
    await axios.delete(`/posts/${route.params.id}`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            router.push('/posts');
        }
    }).catch(function (error) {
        alert('게시글 삭제에 실패했습니다.');
        console.log(error);
    });
}

async function togglePostLike() {
    await axios.post(`/posts/${route.params.id}/like`, {}, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            router.go(0);
        }
    }).catch(function (error) {
        alert('좋아요에 실패했습니다.');
        console.log(error);
    });
}

async function togglePostNotice() {
    await axios.post(`/posts/${route.params.id}/notice`, {}, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            router.go(0);
        }
    }).catch(function (error) {
        alert('공지 설정에 실패했습니다.');
        console.log(error);
    });
}
</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column w-50">
            <h1 class="fw-bold mt-5 mb-3 text-center">여행 정보 공유</h1>
            <div class="d-flex flex-column">
                <router-link to="/posts" class="text-decoration-none text-info mb-2 fw-bold">게시판 &gt;</router-link>
                <span class="fs-4 title mb-3" style="white-space: normal;">
                  <span v-if="state.post.notice" class="badge text-bg-primary">공지</span> {{ state.post.title }}
                </span>
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
                    <div v-if="state.user.role === 'ROLE_ADMIN'">
                        <button v-if="state.post.notice" id="post-notice-button"
                                class="btn btn-primary me-3 text-white" @click="togglePostNotice">공지 해제
                        </button>
                        <button v-else id="post-notice-button" class="btn btn-primary me-3 text-white"
                                @click="togglePostNotice">공지 설정
                        </button>
                    </div>
                    <div v-if="state.user.id === state.post.creatorId">
                        <router-link id="post-update-button" class="btn btn-warning me-3 text-white"
                                     :to="`/posts/${state.post.id}/update`">수정
                        </router-link>
                        <button class="btn btn-danger" @click="deletePost">삭제</button>
                    </div>
                </div>
                <div class="d-flex mb-3">
                    <a href="#" class="text-decoration-none text-danger me-2" @click="togglePostLike">
                        <svg v-if="state.post.liked" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
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
                    <span>좋아요&nbsp;</span>
                    <span class="fw-bold">{{ state.post.likeCount }}</span>
                </div>
                <div>
                    <div class="row">
                        <div class="col-3 d-flex align-items-center mb-3" v-for="user in state.likeUsers">
                            <div class="d-flex me-3">
                                <img :src="`${apiBaseUrl}/users/images/${user.creatorImage}`"
                                     class="rounded-circle border border-2 border-dark" width="32" height="32" alt="">
                            </div>
                            <div class="d-flex flex-column">
                                <span class="fw-bold">{{ user.creatorNickname }}</span>
                                <span class="text-secondary">{{ user.createdAt }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.title {
    word-break: break-all;
}
</style>