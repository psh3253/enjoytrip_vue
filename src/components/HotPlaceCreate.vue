<script setup>

import {computed, onMounted, reactive} from "vue";
import store from "@/store";
import router from "@/router";
import axios from "axios";

const state = reactive({
    name: '',
    visitDate: '',
    content: '',
    placeType: 0,
    latitude: 0,
    longitude: 0,
    file: null,
    marker: null
});

const accessToken = computed(() => store.state.accessToken);

let map = {};

onMounted(async () => {
    if (!accessToken.value) {
        alert('로그인이 필요합니다.');
        await router.push('/login');
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=6deaade886bf865f5888626595e5d66c'
    script.addEventListener('load', () => {
        kakao.maps.load(() => {
            const mapContainer = document.getElementById('map'); // 지도를 표시할 div
            const mapOption = {
                center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
                level: 3 // 지도의 확대 레벨
            };

            // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
            map = new kakao.maps.Map(mapContainer, mapOption);
        })
    })
    document.head.appendChild(script);

    const script2 = document.createElement('script')
    script2.type = 'text/javascript'
    script2.src = 'https://cdn.jsdelivr.net/npm/exif-js'
    document.head.appendChild(script2);
});

async function changeFile(event) {
    if(state.marker !== null) {
        state.marker.setMap(null);
    }
    const imageFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        EXIF.getData(imageFile, () => {
            const tags = EXIF.getAllTags(imageFile);
            console.log(tags)
            if (tags.GPSLatitude === undefined || tags.GPSLongitude === undefined) {
                alert("GPS 정보가 없는 사진입니다. 다른 사진을 올려주세요.")
                event.target.value = "";
                return;
            }
            const lat = tags.GPSLatitude;
            const lng = tags.GPSLongitude;
            const latRef = tags.GPSLatitudeRef || 'N';
            const lngRef = tags.GPSLongitudeRef || 'E';
            const latDeg = lat[0] + lat[1] / 60 + lat[2] / 3600;
            const lngDeg = lng[0] + lng[1] / 60 + lng[2] / 3600;
            const latFinal = latRef === 'N' ? latDeg : -latDeg;
            const lngFinal = lngRef === 'E' ? lngDeg : -lngDeg;

            state.marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(latFinal, lngFinal),
                clickable: true
            });

            state.marker.setMap(map);

            const image = `<div class="d-flex flex-column"><img src="${reader.result}" alt="" class="img-thumbnail mt-3 ms-3 mb-3 me-3" style="width:400px; height:300px"/></div>`;

            const infoWindow = new kakao.maps.InfoWindow({
                content: image,
                removable: true
            });

            kakao.maps.event.addListener(state.marker, 'click', function () {
                infoWindow.open(map, state.marker);
            });
            infoWindow.open(map, state.marker);

            state.latitude = latFinal;
            state.longitude = lngFinal;
            state.file = imageFile;
        });
    }
    if (imageFile) {
        reader.readAsDataURL(imageFile);
    }
}

async function createHotPlace(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', state.name);
    formData.append('visitDate', state.visitDate);
    formData.append('content', state.content);
    formData.append('placeType', state.placeType);
    formData.append('latitude', state.latitude);
    formData.append('longitude', state.longitude);
    formData.append('file', state.file);
    await axios.post('/hot-places', formData, {
        headers: {
            'Authorization': `Bearer ${accessToken.value}`,
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*'
        }
    }).then(function (response) {
        if (response.status === 201) {
            router.push('/hot-places');
        }
    }).catch(function (error) {
        alert('핫플레이스 등록에 실패하였습니다.');
        console.error(error);
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
                    <form @submit="createHotPlace">
                        <div class="mb-3">
                            <label for="place-image" class="form-label text-danger">
                                <span class="d-flex align-items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                         fill="currentColor"
                                         class="bi bi-camera" viewBox="0 0 16 16">
                                        <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
                                        <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                                    </svg>&nbsp;스마트폰으로 찍은 사진을 올려주세요.
                                </span>
                            </label>
                            <input type="file" class="form-control" accept="image/*"
                                   @change="changeFile" required/>
                        </div>
                        <div class="mb-3">
                            <label for="place-name" class="form-label">핫플 이름</label>
                            <input type="text" class="form-control" v-model="state.name" size="15" required/>
                        </div>
                        <div class="mb-3">
                            <label for="date" class="form-label">방문 날짜</label>
                            <input type="date" class="form-control" v-model="state.visitDate" required/>
                        </div>
                        <div class="mb-3">
                            <label for="type-select" class="form-label">장소 유형</label>
                            <select class="form-select" v-model="state.placeType" required>
                                <option value="0" disabled>관광지 유형</option>
                                <option value="12">관광지</option>
                                <option value="14">문화시설</option>
                                <option value="15">행사/공연/축제</option>
                                <option value="25">여행코스</option>
                                <option value="28">레포츠</option>
                                <option value="32">숙박</option>
                                <option value="38">쇼핑</option>
                                <option value="39">음식점</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="content" class="form-label">상세설명</label>
                            <textarea v-model="state.content" class="form-control" required></textarea>
                        </div>
                        <div class="d-flex justify-content-end">
                            <button type="submit" class="btn btn-info text-white">
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>