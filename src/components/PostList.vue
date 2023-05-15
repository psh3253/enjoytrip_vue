<script setup>
import {computed, onMounted, reactive} from "vue";
import axios from "axios";
import store from "@/store";
import router from "@/router";

const state = reactive({
    posts: [],
    page: 1,
    keyword: ''
});
const accessToken = computed(() => store.state.accessToken);

onMounted(async () => {
    if (accessToken.value === null) {
        alert('로그인 후 이용해주세요.');
        await router.push('/login');
        return;
    }
    await axios.get('/posts', {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.posts = response.data.map(post => {
                let now = new Date();
                if (now.getFullYear() === new Date(post.createdAt).getFullYear()
                    && now.getMonth() === new Date(post.createdAt).getMonth()
                    && now.getDate() === new Date(post.createdAt).getDate()) {
                    return {
                        ...post,
                        createdAt: post.createdAt.substring(11, 16)
                    }
                } else {
                    return {
                        ...post,
                        createdAt: post.createdAt.substring(0, 10)
                    }
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
        <div class="d-flex flex-column container">
            <h1 class="fw-bold mt-5 mb-3 text-center">여행 정보 공유</h1>
            <div class="d-flex justify-content-end mb-2">
                <form class="d-flex" action="${root}/posts" method="get">
                    <input class="form-control me-2" type="search" name="keyword" placeholder="검색어를 입력하세요"
                           aria-label="Search">
                    <button class="btn btn-info text-white" type="submit">검색</button>
                </form>
            </div>
            <table class="table table-info table-bordered" style="table-layout: fixed">
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
                <tr v-for="post in state.posts" :key="post.id">
                    <th v-if="post.notice" class="text-center text-primary" scope="row">
                        공지
                    </th>
                    <th v-else class="text-center" scope="row">
                        {{ post.id }}
                    </th>
                    <td>
                        <router-link class="text-decoration-none text-black"
                                     :to="`/posts/${post.id}`">&nbsp;{{ post.title }}
                        </router-link>
                    </td>
                    <td class="text-center">
                        {{ post.creatorNickname }}
                    </td>
                    <td class="text-center">{{ post.createdAt }}</td>
                    <td class="text-center">{{ post.likeCount }}</td>
                    <td class="text-center">{{ post.views }}</td>
                </tr>
                </tbody>
            </table>
            <div class="d-flex justify-content-end">
                <router-link class="btn btn-info text-white" to="/posts/create">글쓰기</router-link>
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

button {
    word-break: keep-all;
}
</style>