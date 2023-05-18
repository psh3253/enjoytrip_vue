<script setup>
import {computed, onMounted, reactive} from "vue";
import store from "@/store";
import axios from "axios";
import router from "@/router";
import {useRoute} from "vue-router";

const state = reactive({
    hotPlace: {}
});

const accessToken = computed(() => store.state.accessToken);

const route = useRoute();

onMounted(async () => {
    if (!accessToken.value) {
        alert('로그인이 필요합니다.');
        router.push('/login');
    }
    await axios.get(`/hot-places/${route.params.id}`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.hotPlace = response.data;
        }
    }).catch(function (error) {
        console.log(error);
    });
});

async function updateHotPlace(event) {
    event.preventDefault();
    await axios.put(`/hot-places/${route.params.id}`,  {
        id: state.hotPlace.id,
        name: state.hotPlace.name,
        visitDate: state.hotPlace.visitDate,
        placeType: state.hotPlace.placeType,
        content: state.hotPlace.content
    }, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            router.push(`/hot-places/${route.params.id}`);
        }
    }).catch(function (error) {
        console.log(error);
    });
}

</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column w-50">
            <h1 class="fw-bold mt-5 mb-3 text-center">핫플레이스</h1>
            <div class="d-flex flex-column">
                <form @submit="updateHotPlace">
                    <div class="mb-3">
                        <label for="place-name" class="form-label">핫플 이름</label>
                        <input type="text" class="form-control" v-model="state.hotPlace.name" size="15" required/>
                    </div>
                    <div class="mb-3">
                        <label for="date" class="form-label">다녀온 날짜</label>
                        <input type="date" class="form-control" v-model="state.hotPlace.visitDate" required/>
                    </div>
                    <div class="mb-3">
                        <label for="type-select" class="form-label">장소 유형</label>
                        <select class="form-select" v-model="state.hotPlace.placeType" required>
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
                        <textarea v-model="state.hotPlace.content" class="form-control" rows="5" required></textarea>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-info text-white" type="submit">수정</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>