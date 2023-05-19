<script setup>
import {computed, onMounted, reactive, readonly, watch} from "vue";
import axios from "axios";
import store from "@/store";
import router from "@/router";

const state = reactive({
    posts: [],
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
    keyword: ''
});
const accessToken = computed(() => store.state.accessToken);

onMounted(async () => {
    if (accessToken.value === null) {
        alert('로그인 후 이용해주세요.');
        await router.push('/login');
        return;
    }
    // querystring으로부터 얻어오기
    state.currentPage = Number(new URLSearchParams(window.location.search).get('page')) || 1;
    state.keyword = new URLSearchParams(window.location.search).get('keyword') || '';
    // 데이터 로딩 함수 호출
    await loadData();
});

function updateCurrentPage(page) {
    state.currentPage = page;
    loadData();
}
 function search(event) {
    event.preventDefault();
    state.currentPage = 1;
    loadData();
}

async function loadData() {
    // 페이지 정보 요청
    await axios.get('/posts/page', {
        params: {
            keyword: state.keyword
        },
        headers: {
            Authorization: `Bearer ${accessToken.value}`
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

    // 포스트 데이터 요청
    await axios.get('/posts', {
        params: {
            keyword: state.keyword,
            page: state.currentPage
        },
        headers: {
            Authorization: `Bearer ${accessToken.value}`
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
        <div class="d-flex flex-column container">
            <h1 class="fw-bold mt-5 mb-3 text-center">여행 정보 공유</h1>
            <div class="d-flex justify-content-end mb-2">
                <form class="d-flex" @submit="search">
                    <input class="form-control me-2" v-model="state.keyword" placeholder="검색어를 입력하세요"
                           aria-label="Search">
                    <button type="submit" class="btn btn-info text-white">검색</button>
                </form>
            </div>
            <table class="table table-bordered" style="table-layout: fixed">
                <thead>
                <tr>
                    <th scope="col" class="text-center" style="width: 7%">번호</th>
                    <th scope="col" class="text-center" style="width: 49%">제목</th>
                    <th scope="col" class="text-center" style="width: 15%">작성자</th>
                    <th scope="col" class="text-center" style="width: 15%">작성일</th>
                    <th scope="col" class="text-center" style="width: 7%">좋아요</th>
                    <th scope="col" class="text-center" style="width: 7%">조회수</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="post in state.posts" :key="post.id" :class="{'bg-light': post.notice}">
                    <th v-if="post.notice" class="text-center text-info fw-bold" scope="row">
                        공지
                    </th>
                    <th v-else class="text-center fw-normal" scope="row">
                        {{ post.id }}
                    </th>
                    <td>
                        <span>
                        <router-link v-if="post.notice" class="text-decoration-none text-info fw-bold"
                                     :to="`/posts/${post.id}`">&nbsp;{{ post.title }}
                        </router-link>
                        <router-link v-else class="text-decoration-none text-black"
                                     :to="`/posts/${post.id}`">&nbsp;{{ post.title }}
                        </router-link>
                            <router-link :to="`/posts/${post.id}#comments`" class="text-info text-decoration-none" v-if="post.commentCount > 0">
                                [{{post.commentCount}}]
                            </router-link>
                        </span>
                    </td>
                    <td class="text-center">
                        <router-link :to="`/users/${post.creatorId}`" class="profile text-reset">{{ post.creatorNickname }}</router-link>
                    </td>
                    <td class="text-center">{{ post.createdAt }}</td>
                    <td class="text-center">{{ post.likeCount }}</td>
                    <td class="text-center">{{ post.views }}</td>
                </tr>
                </tbody>
            </table>
            <div class="d-flex justify-content-end mb-3">
                <router-link class="btn btn-info text-white" to="/posts/create">글쓰기</router-link>
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
</template>

<style scoped>
td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.btn {
    word-break: keep-all;
}
.profile {
    text-decoration: none;
}
.profile:hover {
    text-decoration: underline;
}
</style>