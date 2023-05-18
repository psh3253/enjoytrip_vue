<script setup>
import {onMounted, reactive} from "vue";
import axios from "axios";

const state = reactive({
    noticePosts: [],
    hotPosts: [],
    latestPosts: []
});

onMounted(async () => {
    await axios.get('/posts/home?type=notice').then(function (response) {
        if (response.status === 200) {
            state.noticePosts = response.data;
        }
    }).catch(function (error) {
        console.log(error);
    });

    await axios.get('/posts/home?type=hot').then(function (response) {
        if (response.status === 200) {
            state.hotPosts = response.data;
        }
    }).catch(function (error) {
        console.log(error);
    });

    await axios.get('/posts/home?type=latest').then(function (response) {
        if (response.status === 200) {
            state.latestPosts = response.data;
        }
    }).catch(function (error) {
        console.log(error);
    });
})
</script>

<template>
    <div id="carouselExample" class="carousel slide mt-3 ms-3 me-3 mb-5" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="0" class="active"
                aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="1"
                aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="2"
                aria-label="Slide 3"></button>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item active" data-bs-interval="3000">
          <img src="@/assets/img/1.jpg" class="d-block w-100" alt="" style="height: 700px;">
        </div>
        <div class="carousel-item" data-bs-interval="3000">
          <img src="@/assets/img/2.jpg" class="d-block w-100" alt="" style="height: 700px;">
        </div>
        <div class="carousel-item" data-bs-interval="3000">
          <img src="@/assets/img/3.jpg" class="d-block w-100" alt="" style="height: 700px;">
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
    <div class="container mb-3">
      <div class="row justify-content-center">
        <div class="col-3 border border-info rounded-3 p-3 me-3">
          <div class="d-flex mb-2">
            <span class="fw-bold h4">공지사항</span>
          </div>
          <div class="border mb-3"></div>
          <div>
              <router-link v-for="post in state.noticePosts" :to="`/posts/${post.id}`" :key="`${post.id}`" class="text-decoration-none text-black">
                <p>{{ post.title }}</p>
              </router-link>
          </div>
        </div>
        <div class="col-3 border border-info rounded-3 p-3 me-3">
          <div class="d-flex mb-2">
            <span class="fw-bold h4">인기글</span>
          </div>
          <div class="border mb-3"></div>
          <div>
              <router-link v-for="post in state.hotPosts" :to="`/posts/${post.id}`" :key="`${post.id}`" class="text-decoration-none text-black">
                  <p>{{ post.title }}</p>
              </router-link>
          </div>
        </div>
        <div class="col-3 border border-info rounded-3 p-3">
          <div class="d-flex mb-2">
            <span class="fw-bold h4">최신글</span>
          </div>
          <div class="border mb-3"></div>
          <div>
              <router-link v-for="post in state.latestPosts" :to="`/posts/${post.id}`" :key="`${post.id}`" class="text-decoration-none text-black">
                  <p>{{ post.title }}</p>
              </router-link>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1;
}
</style>