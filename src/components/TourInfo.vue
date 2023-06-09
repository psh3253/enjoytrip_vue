<script setup>
import {onMounted, reactive, readonly} from "vue";
import axios from "axios";

const state = reactive({
    sidos: [],
    guguns: [],
    sidoCode: 0,
    gugunCode: 0,
    contentTypeId: 0,
    markers: [],
    tourList: [],
    latSum: 0,
    lngSum: 0,
    path: {},
    keyword: '',
    contentId: 0,
    destination: '',
});
const noneImage = require('@/assets/img/none.jpg');

let map = {};
// eslint-disable-next-line no-unused-vars
let pathMap = {};

let polylines = [];

onMounted(async () => {
    await axios.get('/tours/sidos')
        .then(function (response) {
            if (response.status === 200) {
                state.sidos = readonly(response.data);
            }
        }).catch(function (error) {
            console.log(error);
        });

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
            const pathMapContainer = document.getElementById('path-map'); // 지도를 표시할 div
            const pathMapOption = {
                center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
                level: 3 // 지도의 확대 레벨
            };

            pathMap = new kakao.maps.Map(pathMapContainer, pathMapOption);
        })
    })
    document.head.appendChild(script)
});

async function getGuguns(event) {
    const sidoCode = event.target.value;
    await axios.get('/tours/guguns', {
        params: {
            sidoCode: sidoCode
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.guguns = readonly(response.data);
        }
    }).catch(function (error) {
        console.log(error);
    });
}

async function search() {
    if (state.sidoCode === 0 || state.gugunCode === 0 || state.contentTypeId === 0) {
        alert('지역과 분류를 선택해주세요.');
        return;
    }
    await axios.get('/tours/attractions', {
        params: {
            sidoCode: state.sidoCode,
            gugunCode: state.gugunCode,
            contentTypeId: state.contentTypeId
        }
    }).then(async function (response) {
        if (response.status === 200) {
            state.tourList = readonly(response.data);

            // 마커 초기화
            for (let i = 0; i < state.markers.length; i++) {
                state.markers[i].setMap(null);
            }
            state.markers = [];
            state.latSum = 0;
            state.lngSum = 0;

            await makeMarker();

            const bounds = new kakao.maps.LatLngBounds();

            for (let i = 0; i < state.tourList.length; i++) {
                bounds.extend(new kakao.maps.LatLng(state.tourList[i].latitude, state.tourList[i].longitude));
            }
            map.setBounds(bounds);
        }
    }).catch(function (error) {
        console.log(error);
    });
}

async function makeMarker() {
    for (let i = 0; i < state.tourList.length; i++) {
        const tour = state.tourList[i];
        const marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(tour.latitude, tour.longitude)
        });
        state.latSum += Number(tour.latitude);
        state.lngSum += Number(tour.longitude);
        state.markers.push(marker);
        let tourInfo;
        if (tour.image !== null && tour.image !== '') {
            tourInfo = `<div class="d-flex flex-column">
                            <img src="${tour.image}" alt="" class="img-thumbnail mt-3 ms-3 mb-3 me-3" style="width:300px; height:200px"/>
                            <h3 class="fw-bold ms-3 me-3 mb-2">${tour.title}</h3>
                            <span class="ms-3 me-3 mb-3">${tour.address}</span>
                            </div>`;
        } else {
            tourInfo = `<div class="d-flex flex-column">
                            <img src="${noneImage}" alt="" class="img-thumbnail mt-3 ms-3 mb-3 me-3" style="width:300px; height:200px"/>
                            <h3 class="fw-bold ms-3 me-3 mb-2">${tour.title}</h3>
                            <span class="ms-3 me-3 mb-3">${tour.address}</span>
                            </div>`;
        }
        const infoWindow = new kakao.maps.InfoWindow({
            content: tourInfo,
            removable: true
        });

        kakao.maps.event.addListener(marker, 'click', function () {
            infoWindow.open(map, marker);
        });
    }
}

function openPathMap(contentId, destination) {
    state.contentId = contentId;
    state.destination = destination;
    state.keyword = '';
    state.path = {};
    for (let i = 0; i < polylines.length; i++) {
        polylines[i].setMap(null);
    }
    setTimeout(function () {
        pathMap.relayout();
    }, 200);
}

async function searchPath() {
    for (let i = 0; i < polylines.length; i++) {
        polylines[i].setMap(null);
    }
    await axios.get('/tours/paths', {
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            contentId: state.contentId,
            keyword: state.keyword
        }
    }).then(function (response) {
        if (response.status === 200) {
            // 시간이 현재 초 단위라 이를 시와 분으로 변환
            // 거리거 현재 m 기준이라 이를 km와 m로 변환
            state.path = {
                ...response.data,
                time: Math.floor(response.data.time / 3600) + '시간 ' + Math.floor((response.data.time % 3600) / 60) + '분',
                distance: Math.floor(response.data.distance / 1000) + 'km ' + response.data.distance % 1000 + 'm'
            };
        }
    }).catch(function (error) {
        console.log(error);
    });
    let points = [];

    for (let i = 0; i < state.path.roadList.length; i++) {
        const road = state.path.roadList[i];
        const trafficState = road.trafficState;
        const coordinates = road.coordinates;
        let color = '#808080';
        if (trafficState === 1) {
            color = '#ff0000';
        } else if (trafficState === 2) {
            color = '#ff8000';
        } else if (trafficState === 3) {
            color = '#ffff00';
        } else if (trafficState === 4) {
            color = '#00ff00';
        }
        let paths = [];
        for (let j = 0; j < coordinates.length; j++) {
            paths.push(new kakao.maps.LatLng(coordinates[j].latitude, coordinates[j].longitude));
            points.push(new kakao.maps.LatLng(coordinates[j].latitude, coordinates[j].longitude));
        }
        const polyline = new kakao.maps.Polyline({
            path: paths, // 선을 구성하는 좌표배열 입니다
            strokeWeight: 5, // 선의 두께 입니다
            strokeColor: color, // 선의 색깔입니다
            strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
            strokeStyle: 'solid' // 선의 스타일입니다
        });
        polylines.push(polyline);
        polyline.setMap(pathMap);
    }
    const bounds = new kakao.maps.LatLngBounds();

    for (let i = 0; i < points.length; i++) {
        bounds.extend(points[i]);
    }
    pathMap.setBounds(bounds);
    // pathMap.setCenter(new kakao.maps.LatLng(state.path.latitude, state.path.longitude));
    // pathMap.setLevel(9);
}

</script>

<template>
    <div class="d-flex flex-column">
        <h1 class="fw-bold mt-5 mb-3 text-center">지역별 관광정보</h1>
        <div class="d-flex justify-content-center mb-3 align-items-center">
            <div class="row me-2">
                <div class="col-4">
                    <select class="form-select" style="min-width: 200px" @change="getGuguns" v-model="state.sidoCode">
                        <option selected disabled value="0">시</option>
                        <option v-for="sido in state.sidos" :key="sido.sidoCode" :value="sido.sidoCode">{{
                            sido.sidoName
                            }}
                        </option>
                    </select>
                </div>
                <div class="col-4">
                    <select class="form-select" style="min-width: 200px" v-model="state.gugunCode">
                        <option selected disabled value="0">구, 군</option>
                        <option v-for="gugun in state.guguns" :key="gugun.gugunCode" :value="gugun.gugunCode">{{
                            gugun.gugunName
                            }}
                        </option>
                    </select>
                </div>
                <div class="col-4">
                    <select class="form-select" v-model="state.contentTypeId">
                        <option selected disabled value="0">관광지 유형</option>
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
            </div>
            <div class="align-self-center">
                <button class="btn btn-info text-white" @click="search">검색</button>
            </div>
        </div>
        <div class="d-flex justify-content-center mb-3">
            <div id="map" class="w-75" style="width:500px;height:700px;"></div>
        </div>
        <p class="text-center fw-bold">※ 최대 30개만 표시됩니다.</p>
        <div class="d-flex justify-content-center mb-5">
            <div class="container-fluid w-75 text-center">
                <table class="table table-hover table-bordered round-3 mb-3">
                    <thead>
                    <tr>
                        <th scope="col" style="width: 10%;">사진</th>
                        <th scope="col" style="width: 30%;">이름</th>
                        <th scope="col" style="width: 50%;">주소</th>
                        <th scope="col" style="width: 10%;">경로 보기</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="tour in state.tourList" :key="tour.title">
                        <td>
                            <img v-if="tour.image != null && tour.image !== ''" :src="tour.image" alt=""
                                 style="width: 64px; height: 64px">
                            <img v-else src="@/assets/img/none.jpg" alt="" style="width: 64px; height: 64px">
                        </td>
                        <td class="align-middle fw-bold">{{ tour.title }}</td>
                        <td class="align-middle">{{ tour.address }}</td>
                        <td class="align-middle">
                            <button type="button" class="btn btn-info text-white" data-bs-target="#pathModal"
                                    data-bs-toggle="modal" @click="openPathMap(tour.contentId, tour.title)">
                                보기
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal fade" id="pathModal" aria-hidden="true" aria-labelledby="pathLabel" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="pathLabel">경로 탐색</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex">
                        <div class="d-flex me-3">
                            <div id="path-map" style="width: 500px; height: 700px"></div>
                        </div>
                        <div class="d-flex flex-column">
                            <div class="mb-3">
                                <label class="form-label">출발지</label>
                                <input type="text" v-model="state.keyword" class="form-control" placeholder="예) 서울시청">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">도착지</label>
                                <input type="text" v-model="state.destination" class="form-control" disabled>
                            </div>
                            <div class="mb-3">
                                <button class="btn btn-info text-white container-fluid" @click="searchPath()">탐색
                                </button>
                            </div>
                            <div class="mb-3">
                                <p>예상 시간 : {{ state.path.time }}</p>
                                <p>예상 거리 : {{ state.path.distance }}</p>
                                <p>예상 택시 요금 : {{ state.path.taxiFare }}원</p>
                                <p>예상 톨게이트 요금 : {{ state.path.tollFare }}원</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>