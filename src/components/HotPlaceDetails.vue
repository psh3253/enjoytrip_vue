<script setup>
import {computed, onMounted, reactive} from "vue";
import {useRoute} from "vue-router";
import axios from "axios";
import store from "@/store";
import router from "@/router";

const state = reactive({
    hotPlace: {},
    user: {}
});

const route = useRoute();
const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;
const accessToken = computed(() => store.state.accessToken);

onMounted(async () => {
    if (!accessToken.value) {
        alert('로그인이 필요합니다.');
        await router.push('/login');
    }

    await axios.get(`/hot-places/${route.params.id}`, {}).then(async function (response) {
        if (response.status === 200) {
            // createdAt 날짜 형식 변환
            state.hotPlace = {
                ...response.data,
                createdAt: response.data.createdAt.substring(0, 16).replace('T', ' ')
            };
        }
    }).catch(function (error) {
        console.log(error);
    });

    await axios.get('/users/me', {}).then(function (response) {
        if (response.status === 200) {
            state.user = response.data;
        }
    }).catch(function (error) {
        console.log(error);
    });

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=6deaade886bf865f5888626595e5d66c'
    await script.addEventListener('load', () => {
        kakao.maps.load(() => {
            const mapContainer = document.getElementById('map'); // 지도를 표시할 div
            const mapOption = {
                center: new kakao.maps.LatLng(state.hotPlace.latitude, state.hotPlace.longitude), // 지도의 중심좌표
                level: 3 // 지도의 확대 레벨
            };

            // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
            const map = new kakao.maps.Map(mapContainer, mapOption);

            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(state.hotPlace.latitude, state.hotPlace.longitude),
                clickable: true
            });

            marker.setMap(map);

            const image = `<div class="d-flex flex-column"><img src="${apiBaseUrl}/hot-places/images/${state.hotPlace.imageFileName}" alt="" class="img-thumbnail mt-3 ms-3 mb-3 me-3" style="width:400px; height:300px"/></div>`;

            const infoWindow = new kakao.maps.InfoWindow({
                content: image,
                removable: true
            });

            kakao.maps.event.addListener(marker, 'click', function () {
                infoWindow.open(map, marker);
            });
            infoWindow.open(map, marker);
        })
    })
    document.head.appendChild(script);

    const script2 = document.createElement('script')
    script2.type = 'text/javascript'
    script2.src = 'https://cdn.jsdelivr.net/npm/exif-js'
    document.head.appendChild(script2);
});

async function deleteHotPlace()
{
    if(!confirm('삭제하시겠습니까?')) {
        return;
    }
    await axios.delete(`/hot-places/${route.params.id}`, {}).then(function (response) {
        if (response.status === 200) {
            alert('삭제되었습니다.');
            router.push('/hot-places');
        }
    }).catch(function (error) {
        console.log(error);
    });
}

</script>

<template>
    <div class="d-flex flex-column align-items-center">
        <h1 class="fw-bold mt-5 mb-3">핫플레이스</h1>
        <div class="container mb-5">
            <div class="row">
                <div class="col-6">
                    <div id="map" style="width: 100%; height: 600px"></div>
                </div>
                <div class="col-6">
                    <div class="d-flex flex-column">
                        <router-link to="/hot-places" class="text-decoration-none text-info mb-2 fw-bold">핫플레이스 &gt;
                        </router-link>
                        <div class="d-flex align-items-center">
                            <h2>{{ state.hotPlace.name }}</h2>
                        </div>
                        <div class="d-flex align-items-center mb-3">
                            <div class="d-flex me-3">
                                <img :src="`${apiBaseUrl}/users/images/${state.hotPlace.creatorImage}`"
                                     class="rounded-circle border border-2 border-dark" width="64" height="64" alt="">
                            </div>
                            <div class="d-flex flex-column">
                                <span class="fw-bold"><router-link :to="`/users/${state.hotPlace.creatorId}`" class="profile text-reset">{{ state.hotPlace.creatorNickname }}</router-link></span>
                                <span class="text-secondary">{{ state.hotPlace.createdAt }}&nbsp;조회&nbsp;{{state.hotPlace.views}}</span>
                            </div>
                        </div>
                        <p class="fw-bold">다녀온 날짜 : {{ state.hotPlace.visitDate }}</p>
                        <p class="fw-bold">
                            장소 유형 :
                            <span v-if="state.hotPlace.placeType === 12">관광지</span>
                            <span v-else-if="state.hotPlace.placeType === 14">문화시설</span>
                            <span v-else-if="state.hotPlace.placeType === 15">행사/공연/축제</span>
                            <span v-else-if="state.hotPlace.placeType === 25">여행코스</span>
                            <span v-else-if="state.hotPlace.placeType === 28">레포츠</span>
                            <span v-else-if="state.hotPlace.placeType === 32">숙박</span>
                            <span v-else-if="state.hotPlace.placeType === 38">쇼핑</span>
                            <span v-else-if="state.hotPlace.placeType === 39">음식점</span>
                        </p>
                        <p class="fw-bold">주소 : {{ state.hotPlace.address }}</p>
                        <p class="mb-3">{{ state.hotPlace.content }}</p>
                        <div class="d-flex justify-content-end" v-if="state.hotPlace.creatorId === state.user.id">
                            <router-link class="btn btn-warning me-3 text-white"
                                         :to="`/hot-places/${state.hotPlace.id}/update`">수정
                            </router-link>
                            <button class="btn btn-danger" @click="deleteHotPlace">삭제</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile {
    text-decoration: none;
}
.profile:hover {
    text-decoration: underline;
}
</style>