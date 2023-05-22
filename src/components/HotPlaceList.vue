<script setup>
import {computed, onMounted, reactive, readonly, watch} from "vue";
import axios from "axios";
import store from "@/store";
import router from "@/router";

const state = reactive({
    hotPlaces: [],
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

const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;
const accessToken = computed(() => store.state.accessToken);

onMounted(async () => {
    if (!accessToken.value) {
        alert('로그인이 필요합니다.');
        await router.push('/login');
    }

    // querystring으로부터 얻어오기
    state.currentPage = Number(new URLSearchParams(window.location.search).get('page')) || 1;
    state.keyword = new URLSearchParams(window.location.search).get('keyword') || '';
    // 데이터 로딩 함수 호출
    await loadData();
})

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
    await axios.get('/hot-places/page', {
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

    // 핫플레이스 데이터 요청
    await axios.get('/hot-places', {
        params: {
            keyword: state.keyword,
            page: state.currentPage
        },
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.hotPlaces = response.data.map(hotPlace => {
                let now = new Date();
                if (now.getFullYear() === new Date(hotPlace.createdAt).getFullYear() &&
                    now.getMonth() === new Date(hotPlace.createdAt).getMonth() &&
                    now.getDate() === new Date(hotPlace.createdAt).getDate()
                ) {
                    return {
                        ...hotPlace,
                        createdAt: hotPlace.createdAt.substring(11, 16)
                    };
                } else {
                    return {
                        ...hotPlace,
                        createdAt: hotPlace.createdAt.substring(0, 10)
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
            <h1 class="fw-bold mt-5 mb-3 text-center">핫플레이스</h1>
            <div class="d-flex justify-content-end mb-3">
                <form class="d-flex" @submit="search">
                    <input class="form-control me-2" v-model="state.keyword" placeholder="검색어를 입력하세요"
                           aria-label="Search">
                    <button type="submit" class="btn btn-info text-white">검색</button>
                </form>
            </div>
            <div class="row mb-3">
                <div class="col-3" v-for="hotPlace in state.hotPlaces" :key="hotPlace.id">
                    <div class="card mx-1 mb-4 text-decoration-none text-black">
                        <div class="carousel" data-bs-ride="carousel">
                            <div class="carousel-inner">
                                <div class="carousel-item active">
                                    <router-link :to="`/hot-places/${hotPlace.id}`" class="text-decoration-none">
                                        <img :src="`${apiBaseUrl}/hot-places/images/${hotPlace.imageFileName}`"
                                             class="card-img-top" alt="">
                                    </router-link>
                                </div>
                            </div>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <router-link :to="`/hot-places/${hotPlace.id}`"
                                         class="card-title text-decoration-none h5 text-reset fw-bold">{{
                                hotPlace.name
                                }}
                            </router-link>
                            <span class="mb-1">
                            <span v-if="hotPlace.placeType === 12" class="card-text h-6">관광지</span>
                            <span v-else-if="hotPlace.placeType === 14" class="card-text h-6">문화시설</span>
                            <span v-else-if="hotPlace.placeType === 15" class="card-text h-6">축제/공연/행사</span>
                            <span v-else-if="hotPlace.placeType === 28" class="card-text h-6">레포츠</span>
                            <span v-else-if="hotPlace.placeType === 32" class="card-text h-6">숙박</span>
                            <span v-else-if="hotPlace.placeType === 38" class="card-text h-6">쇼핑</span>
                            <span v-else-if="hotPlace.placeType === 39" class="card-text h-6">음식점</span>
                                </span>
                            <span class="card-text mb-1">{{ hotPlace.address }}</span>
                            <span class="card-text mb-1">
                                <router-link :to="`/users/${hotPlace.creatorId}`"
                                             class="text-secondary profile">
                                    {{ hotPlace.creatorNickname }}</router-link>
                            </span>
                            <span class="card-text text-secondary text-opacity-75 fs-6">{{ hotPlace.createdAt }} 조회 {{hotPlace.views}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                <router-link to="/hot-places/create" class="btn btn-info text-white">핫플 자랑하기</router-link>
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
button {
    word-break: keep-all;
}
.card-title, .card-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.profile {
    text-decoration: none;
}
.profile:hover {
    text-decoration: underline;
}
</style>