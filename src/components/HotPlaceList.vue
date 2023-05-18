<script setup>
import {computed, onMounted, reactive, readonly} from "vue";
import axios from "axios";
import store from "@/store";
import router from "@/router";

const state = reactive({
    hotPlaces: []
});

const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;
const accessToken = computed(() => store.state.accessToken);

onMounted(async () => {
    if(!accessToken.value) {
        alert('로그인이 필요합니다.');
        await router.push('/login');
    }
    await axios.get('/hot-places', {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
            if (response.status === 200) {
                state.hotPlaces = response.data;
            }
        }).catch(function (error) {
            console.log(error);
        });
})
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
                    <router-link :to="`/hot-places/${hotPlace.id}`" class="card mx-1 mb-3 text-decoration-none text-black">
                        <div class="carousel" data-bs-ride="carousel">
                            <div class="carousel-inner">
                                <div class="carousel-item active">
                                    <img :src="`${apiBaseUrl}/hot-places/images/${hotPlace.imageFileName}`" class="card-img-top" alt="">
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">{{hotPlace.name}}</h5>
                                <p v-if="hotPlace.placeType === 12" class="card-text h-6">관광지</p>
                                <p v-else-if="hotPlace.placeType === 14" class="card-text h-6">문화시설</p>
                                <p v-else-if="hotPlace.placeType === 15" class="card-text h-6">축제/공연/행사</p>
                                <p v-else-if="hotPlace.placeType === 28" class="card-text h-6">레포츠</p>
                                <p v-else-if="hotPlace.placeType === 32" class="card-text h-6">숙박</p>
                                <p v-else-if="hotPlace.placeType === 38" class="card-text h-6">쇼핑</p>
                                <p v-else-if="hotPlace.placeType === 39" class="card-text h-6">음식점</p>
                        </div>
                    </router-link>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                <router-link to="/hot-places/create" class="btn btn-info text-white">핫플 자랑하기</router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
button {
    word-break: keep-all;
}
</style>