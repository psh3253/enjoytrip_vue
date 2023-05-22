<script setup>
import {computed, onMounted, reactive} from "vue";
import store from "@/store";
import router from "@/router";
import {useRoute} from "vue-router";
import axios from "axios";

const accessToken = computed(() => store.state.accessToken);
const route = useRoute();
const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;

const state = reactive({
    user: {},
    posts: [],
    likePosts: [],
    commentPosts: [],
    postsCurrentPage: 1,
    likePostsCurrentPage: 1,
    commentPostsCurrentPage: 1,
});

onMounted(async () => {
    if (!accessToken.value) {
        alert('로그인이 필요합니다.');
        await router.push('/login');
    }

    await axios.get(`/users/${route.params.id}`, {}).then(function (response) {
        if (response.status === 200) {
            state.user = {
                ...response.data,
                createdAt: response.data.createdAt.substring(0, 10)
            }
        }
    }).catch(function (error) {
        console.log(error);
    });

    await axios.get(`/users/${route.params.id}/posts`, {
        params: {
            type: 'post',
            page: state.postsCurrentPage
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.posts = response.data.map(post => {
                let now = new Date();
                if (now.getFullYear() === new Date(post.createdAt).getFullYear() &&
                    now.getMonth() === new Date(post.createdAt).getMonth() &&
                    now.getDate() === new Date(post.createdAt).getDate()
                ) {
                    return {
                        ...post,
                        createdAt: post.createdAt.substring(11, 16)
                    };
                } else {
                    return {
                        ...post,
                        createdAt: post.createdAt.substring(0, 10)
                    };
                }
            });
        }
    }).catch(function (error) {
        console.log(error);
    });

    await axios.get(`/users/${route.params.id}/posts`, {
        params: {
            type: 'like',
            page: state.likePostsCurrentPage
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.likePosts = response.data.map(post => {
                let now = new Date();
                if (now.getFullYear() === new Date(post.createdAt).getFullYear() &&
                    now.getMonth() === new Date(post.createdAt).getMonth() &&
                    now.getDate() === new Date(post.createdAt).getDate()
                ) {
                    return {
                        ...post,
                        createdAt: post.createdAt.substring(11, 16)
                    };
                } else {
                    return {
                        ...post,
                        createdAt: post.createdAt.substring(0, 10)
                    };
                }
            });
        }
    }).catch(function (error) {
        console.log(error);
    });

    await axios.get(`/users/${route.params.id}/posts`, {
        params: {
            type: 'comment',
            page: state.commentPostsCurrentPage
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.commentPosts = response.data.map(post => {
                let now = new Date();
                if (now.getFullYear() === new Date(post.createdAt).getFullYear() &&
                    now.getMonth() === new Date(post.createdAt).getMonth() &&
                    now.getDate() === new Date(post.createdAt).getDate()
                ) {
                    return {
                        ...post,
                        createdAt: post.createdAt.substring(11, 16)
                    };
                } else {
                    return {
                        ...post,
                        createdAt: post.createdAt.substring(0, 10)
                    };
                }
            });
        }
    }).catch(function (error) {
        console.log(error);
    });
});
</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column w-50">
            <h1 class="fw-bold mt-5 mb-3 text-center">프로필 정보</h1>
            <div class="d-flex flex-column">
                <div class="d-flex align-items-center mb-3">
                    <div class="d-flex me-3">
                        <img :src="`${apiBaseUrl}/users/images/${state.user.imageFileName}`"
                             class="rounded-circle border border-2 border-dark" width="64" height="64" alt="">
                    </div>
                    <div class="d-flex flex-column">
                        <span class="fw-bold">{{ state.user.nickname }}({{ state.user.email }})
                             <span v-if="state.user.role === 'ROLE_ADMIN'" class="badge bg-danger">관리자</span>
                            <span v-else class="badge bg-info">일반회원</span>
                        </span>
                        <span class="text-secondary">
                            <span class="me-3">가입 {{ state.user.createdAt }}</span>
                            <span class="me-3">작성글 <span class="fw-bold text-black">{{
                                state.user.postCount
                                }}</span></span>
                            <span class="me-3">댓글 <span class="fw-bold text-black">{{ state.user.commentCount }}</span></span>
                            <span>핫플레이스 <span class="fw-bold text-black">{{ state.user.hotPlaceCount }}</span></span>
                        </span>
                    </div>
                </div>
                <div>
                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active custom-color" id="post-tab" data-bs-toggle="tab"
                                    data-bs-target="#post-tab-pane" type="button" role="tab"
                                    aria-controls="home-tab-pane" aria-selected="true">작성글
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link custom-color" id="comment-tab" data-bs-toggle="tab"
                                    data-bs-target="#comment-tab-pane" type="button" role="tab"
                                    aria-controls="profile-tab-pane" aria-selected="false">댓글단 글
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link custom-color" id="like-tab" data-bs-toggle="tab"
                                    data-bs-target="#like-tab-pane" type="button" role="tab"
                                    aria-controls="like-tab-pane" aria-selected="false">좋아요한 글
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link custom-color" id="hot-place-tab" data-bs-toggle="tab"
                                    data-bs-target="#hot-place-tab-pane" type="button" role="tab"
                                    aria-controls="hot-place-tab-pane" aria-selected="false">핫플레이스
                            </button>
                        </li>
                    </ul>
                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active" id="post-tab-pane" role="tabpanel"
                             aria-labelledby="post-tab" tabindex="0">
                            <table class="table" style="table-layout: fixed">
                                <thead>
                                <tr>
                                    <th scope="col" class="text-center" style="width: 10%;">번호</th>
                                    <th scope="col" class="text-center" style="width: 60%">제목</th>
                                    <th scope="col" class="text-center" style="width: 20%">작성일</th>
                                    <th scope="col" class="text-center" style="width: 10%">조회수</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="post in state.posts" :key="post.id">
                                    <td class="text-center">{{ post.id }}</td>
                                    <td>
                                        <router-link class="text-decoration-none text-reset" :to="`/posts/${post.id}`">
                                            &nbsp;{{ post.title }}
                                        </router-link>
                                    </td>
                                    <td class="text-center">{{ post.createdAt }}</td>
                                    <td class="text-center">{{ post.views }}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="tab-pane fade" id="comment-tab-pane" role="tabpanel" aria-labelledby="comment-tab"
                             tabindex="0">
                            <table class="table" style="table-layout: fixed">
                                <thead>
                                <tr>
                                    <th scope="col" class="text-center" style="width: 7%;">번호</th>
                                    <th scope="col" class="text-center" style="width: 56%">제목</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성자</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성일</th>
                                    <th scope="col" class="text-center" style="width: 7%">조회수</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="post in state.commentPosts" :key="post.id">
                                    <td class="text-center">{{ post.id }}</td>
                                    <td>
                                        <span>
                                            <router-link class="text-decoration-none text-reset"
                                                         :to="`/posts/${post.id}`">&nbsp;{{ post.title }}</router-link>
                                        </span>
                                    </td>
                                    <td class="text-center">{{ post.creatorNickname }}</td>
                                    <td class="text-center">{{ post.createdAt }}</td>
                                    <td class="text-center">{{ post.views }}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="tab-pane fade" id="like-tab-pane" role="tabpanel" aria-labelledby="like-tab"
                             tabindex="0">
                            <table class="table" style="table-layout: fixed">
                                <thead>
                                <tr>
                                    <th scope="col" class="text-center" style="width: 7%;">번호</th>
                                    <th scope="col" class="text-center" style="width: 56%">제목</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성자</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성일</th>
                                    <th scope="col" class="text-center" style="width: 7%">조회수</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="post in state.likePosts" :key="post.id">
                                    <td class="text-center">{{ post.id }}</td>
                                    <td>
                                        <span>
                                            <router-link class="text-decoration-none text-reset"
                                                         :to="`/posts/${post.id}`">&nbsp;{{ post.title }}</router-link>
                                        </span>
                                    </td>
                                    <td class="text-center">{{ post.creatorNickname }}</td>
                                    <td class="text-center">{{ post.createdAt }}</td>
                                    <td class="text-center">{{ post.views }}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="tab-pane fade" id="hot-place-tab-pane" role="tabpanel"
                             aria-labelledby="hot-place-tab" tabindex="0">...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.nav-link.active {
    color: #6c757d;
}

.nav-link:not(.active) {
    color: #0dcaf0;
}

td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>