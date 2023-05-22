<script setup>
import {computed, onMounted, reactive, readonly, watch} from "vue";
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
    // likePosts: [],
    // commentPosts: [],
    // postsCurrentPage: 1,
    // likePostsCurrentPage: 1,
    // commentPostsCurrentPage: 1,

    type: "post",
    startPage: 1,
    endPage: 1,
    currentPage: 1,
    currentPageGroup: 1,
    pageGroup: [],
    nextPageGroup: 1,
    prevPageGroup: 1,
    nextPageGroupPage: 1,
    prevPageGroupPage: 1,
    maxPage: 1,
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

    loadData();
});

function updateCurrentPage(page) {
    state.currentPage = page;
    loadData();
}

function updateType(type) {
    state.currentPage = 1;
    state.type = type;
    loadData();
}

async function loadData() {
    //페이지 정보 요청
    let url = `/posts`; // 요청 URL
    if (state.type === "hotPlace") {
        url = "/hot-places";
    }

    await axios.get(url+`/profile-page`, {
        params: {
            type: state.type
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.maxPage = readonly(response.data);
        }
    }).catch(function (error) {
        console.log(error);
    });

    state.currentPageGroup = Math.floor((state.currentPage - 1) / 10);
    state.nextPageGroup = state.currentPageGroup + 1;
    state.nextPageGroupPage = state.nextPageGroup * 10 + 1;
    state.prevPageGroup = state.currentPageGroup - 1;
    state.prevPageGroupPage = state.prevPageGroup * 10 + 10;
    state.startPage = state.currentPageGroup * 10 + 1;
    state.endPage = Math.min(state.startPage + 9, state.maxPage);
    state.pageGroup = [];
    for (let i = state.startPage; i <= state.endPage; i++) {
        state.pageGroup.push(i);
    }
    
    await axios.get(url+`/profile-posts`, {
        params: {
            type: state.type,
            page: state.currentPage
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
}

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
                                    aria-controls="home-tab-pane" aria-selected="true" @click="updateType('post')">작성글
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link custom-color" id="comment-tab" data-bs-toggle="tab"
                                    data-bs-target="#comment-tab-pane" type="button" role="tab"
                                    aria-controls="profile-tab-pane" aria-selected="false" @click="updateType('comment')">댓글단 글
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link custom-color" id="like-tab" data-bs-toggle="tab"
                                    data-bs-target="#like-tab-pane" type="button" role="tab"
                                    aria-controls="like-tab-pane" aria-selected="false" @click="updateType('like')">좋아요한 글
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link custom-color" id="hot-place-tab" data-bs-toggle="tab"
                                    data-bs-target="#hot-place-tab-pane" type="button" role="tab"
                                    aria-controls="hot-place-tab-pane" aria-selected="false" @click="updateType('hotPlace')">핫플레이스
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
                                    <th scope="col" class="text-center" style="width: 10%;">번호</th>
                                    <th scope="col" class="text-center" style="width: 53%">제목</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성자</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성일</th>
                                    <th scope="col" class="text-center" style="width: 7%">조회수</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="post in state.posts" :key="post.id">
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
                                    <th scope="col" class="text-center" style="width: 10%;">번호</th>
                                    <th scope="col" class="text-center" style="width: 53%">제목</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성자</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성일</th>
                                    <th scope="col" class="text-center" style="width: 7%">조회수</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="post in state.posts" :key="post.id">
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
                             aria-labelledby="hot-place-tab" tabindex="0">
                             <table class="table" style="table-layout: fixed">
                                <thead>
                                <tr>
                                    <th scope="col" class="text-center" style="width: 10%;">번호</th>
                                    <th scope="col" class="text-center" style="width: 53%">이름</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성자</th>
                                    <th scope="col" class="text-center" style="width: 15%">작성일</th>
                                    <th scope="col" class="text-center" style="width: 7%">조회수</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="post in state.posts" :key="post.id">
                                    <td class="text-center">{{ post.id }}</td>
                                    <td>
                                        <span>
                                            <router-link class="text-decoration-none text-reset"
                                                         :to="`/hot-places/${post.id}`">&nbsp;{{ post.name }}</router-link>
                                        </span>
                                    </td>
                                    <td class="text-center">{{ post.creatorNickname }}</td>
                                    <td class="text-center">{{ post.createdAt }}</td>
                                    <td class="text-center">{{ post.views }}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="d-flex justify-content-center">
                            <nav>
                                <ul class="pagination">
                                    <!-- li속성에 page-item을 class에 추가하고 특정 조건에 따라 disabled를 추가해야함 -->
                                    <li :class="[{'page-item': true}, {'disabled': state.prevPageGroup < 0}]">
                                        <button :class="[{'page-link': true}, {'text-info': state.prevPageGroupPage > 0}]"
                                                    @click="updateCurrentPage(state.prevPageGroupPage)">이전
                                        </button>
                                    </li>
                                    <li v-for="page in state.pageGroup" :key="page"
                                        :class="[{'page-item': true}, {'active': page === state.currentPage}]">
                                        <button v-if="page === state.currentPage"
                                                    class="page-link bg-info text-white border-info"
                                                    @click="updateCurrentPage(page)">{{ page }}
                                        </button>
                                        <button v-else class="page-link text-info"
                                                    @click="updateCurrentPage(page)">{{ page }}
                                        </button>
                                    </li>
                                    <li :class="[{'page-item': true}, {'disabled': state.nextPageGroupPage > state.maxPage}]">
                                        <button
                                                :class="[{'page-link': true}, {'text-info': state.nextPageGroupPage <= state.maxPage}]"
                                                @click="updateCurrentPage(state.nextPageGroupPage)">다음
                                        </button>
                                    </li>
                                </ul>
                            </nav>
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