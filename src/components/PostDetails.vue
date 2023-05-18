<script setup>
import {computed, onMounted, reactive, readonly} from "vue";
import axios from "axios";
import {useRoute} from "vue-router";
import store from "@/store";
import router from "@/router";

const state = reactive({
    post: {},
    comments: [],
    user: {},
    likeUsers: [],
    comment: '',
    showLikes: false,
    showComments: true
});
const accessToken = computed(() => store.state.accessToken);
const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;

const route = useRoute();

onMounted(async () => {
    if (!accessToken.value) {
        alert('로그인이 필요합니다.');
        await router.push('/login');
        return;
    }

    await getPost();
    await getLikeUsers();
    await getComments();

    await axios.get(`/users/me`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.user = readonly(response.data);
        }
    }).catch(function (error) {
        console.log(error);
    });
});

async function getPost() {
    await axios.get(`/posts/${route.params.id}`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.post = {...response.data, createdAt: response.data.createdAt.substring(0, 16).replace('T', ' ')}
        }
    }).catch(function (error) {
        console.log(error);
    });
}

async function deletePost() {
    if (!confirm('게시글을 삭제하시겠습니까?')) {
        return;
    }
    await axios.delete(`/posts/${route.params.id}`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            router.push('/posts');
        }
    }).catch(function (error) {
        alert('게시글 삭제에 실패했습니다.');
        console.log(error);
    });
}

async function createComment(event) {
    event.preventDefault();
    await axios.post(`/posts/${route.params.id}/comments`, {
        content: state.comment
    }, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`,
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        if (response.status === 201) {
            getComments();
            state.comment = '';
        }
    }).catch(function (error) {
        alert('댓글 작성에 실패했습니다.');
        console.log(error);
    });
}

async function deleteComment(id) {
    if(!confirm('댓글을 삭제하시겠습니까?')) {
        return;
    }
    await axios.delete(`/posts/${route.params.id}/comments/${id}`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            getComments();
        }
    }).catch(function (error) {
        alert('댓글 삭제에 실패했습니다.');
        console.log(error);
    });
}

async function getLikeUsers() {
    await axios.get(`/posts/${route.params.id}/like`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.likeUsers = response.data.map(user => {
                let now = new Date();
                if (now.getFullYear() === new Date(user.createdAt).getFullYear() &&
                    now.getMonth() === new Date(user.createdAt).getMonth() &&
                    now.getDate() === new Date(user.createdAt).getDate()
                ) {
                    return {
                        ...user,
                        createdAt: user.createdAt.substring(11, 16)
                    };
                } else {
                    return {
                        ...user,
                        createdAt: user.createdAt.substring(0, 10)
                    };
                }
            });
        }
    }).catch(function (error) {
        console.log(error);
    });
}

async function getComments() {
    await axios.get(`/posts/${route.params.id}/comments`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            state.comments = response.data.map(comment => {
                return {
                    ...comment,
                    createdAt: comment.createdAt.replace('T', ' ').substring(0, 16)
                };
            });
        }
    }).catch(function (error) {
        console.log(error);
    });
}
async function togglePostLike() {
    await axios.post(`/posts/${route.params.id}/like`, {}, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            getPost();
            getLikeUsers();
        }
    }).catch(function (error) {
        alert('좋아요에 실패했습니다.');
        console.log(error);
    });
}

async function togglePostNotice() {
    await axios.post(`/posts/${route.params.id}/notice`, {}, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }).then(function (response) {
        if (response.status === 200) {
            getPost();
        }
    }).catch(function (error) {
        alert('공지 설정에 실패했습니다.');
        console.log(error);
    });
}

function showLikes() {
    state.showLikes = true;
    state.showComments = false;
}

function showComments() {
    state.showLikes = false;
    state.showComments = true;
}
</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column w-50">
            <h1 class="fw-bold mt-5 mb-3 text-center">여행 정보 공유</h1>
            <div class="d-flex flex-column">
                <router-link to="/posts" class="text-decoration-none text-info mb-2 fw-bold">게시판 &gt;</router-link>
                <span class="fs-4 title mb-3" style="white-space: normal;">
                  <span v-if="state.post.notice" class="badge text-bg-primary">공지</span> {{ state.post.title }}
                </span>
                <div class="d-flex align-items-center mb-2">
                    <div class="d-flex me-3">
                        <img src="@/assets/img/no-profile-image.png"
                             class="rounded-circle border border-2 border-dark" width="64" height="64" alt="">
                    </div>
                    <div class="d-flex flex-column">
                        <span class="fw-bold">{{ state.post.creatorNickname }}</span>
                        <span class="text-secondary">{{ state.post.createdAt }}&nbsp;조회&nbsp;{{
                            state.post.views
                            }}</span>
                    </div>
                </div>
                <hr>
                <p class="mb-3">{{ state.post.content }}</p>
                <div class="d-flex justify-content-end">
                    <div v-if="state.user.role === 'ROLE_ADMIN'">
                        <button v-if="state.post.notice" id="post-notice-button"
                                class="btn btn-primary me-3 text-white" @click="togglePostNotice">공지 해제
                        </button>
                        <button v-else id="post-notice-button" class="btn btn-primary me-3 text-white"
                                @click="togglePostNotice">공지 설정
                        </button>
                    </div>
                    <div v-if="state.user.id === state.post.creatorId">
                        <router-link id="post-update-button" class="btn btn-warning me-3 text-white"
                                     :to="`/posts/${state.post.id}/update`">수정
                        </router-link>
                        <button class="btn btn-danger" @click="deletePost">삭제</button>
                    </div>
                </div>
                <hr>
                <div class="d-flex mb-3">
                    <span class="text-decoration-none text-danger me-2" @click="togglePostLike" style="cursor:pointer;">
                        <svg v-if="state.post.liked" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                             fill="currentColor"
                             class="bi bi-heart-fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd"
                                  d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"></path>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             class="bi bi-heart" viewBox="0 0 16 16">
                            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"></path>
                        </svg>
                    </span>
                    <span style="cursor: pointer" @click="showLikes">
                        <span>좋아요&nbsp;</span>
                        <span class="fw-bold">{{ state.post.likeCount }}</span>
                    </span>
                    <span style="cursor: pointer" @click="showComments">
                        <span>&nbsp;댓글&nbsp;</span>
                        <span class="fw-bold">{{ state.comments.length }}</span>
                    </span>
                </div>
                <div class="likes" v-if="state.showLikes">
                    <div class="row">
                        <div class="col-3 d-flex align-items-center mb-3" v-for="user in state.likeUsers"
                             :key="user.id">
                            <div class="d-flex me-3">
                                <img :src="`${apiBaseUrl}/users/images/${user.creatorImage}`"
                                     class="rounded-circle border border-2 border-dark" width="32" height="32" alt="">
                            </div>
                            <div class="d-flex flex-column">
                                <span class="fw-bold">{{ user.creatorNickname }}</span>
                                <span class="text-secondary fs-6">{{ user.createdAt }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex flex-column" id="comments" v-if="state.showComments">
                    <div class="d-flex flex-column">
                        <div class="d-flex flex-column" v-for="comment in state.comments" :key="comment.id">
                            <div class="d-flex">
                                <div class="me-3">
                                    <img :src="`${apiBaseUrl}/users/images/${comment.creatorImage}`"
                                         class="rounded-circle border border-2 border-dark" width="32" height="32"
                                         alt="">
                                </div>
                                <div class="d-flex flex-column flex-fill">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="fw-bold">{{ comment.creatorNickname }}&nbsp;
                                        <span v-if="state.post.creatorId === comment.creatorId" class="badge bg-info">
                                            작성자
                                        </span>
                                    </span>
                                        <button v-if="state.user.id === comment.creatorId"
                                                class="btn btn-sm btn-danger" @click="deleteComment(comment.id)">
                                            삭제
                                        </button>
                                    </div>
                                    <p>{{ comment.content }}</p>
                                    <span class="fw-light fs-6">{{ comment.createdAt }}</span>
                                </div>
                            </div>
                            <hr>
                        </div>
                    </div>
                    <div class="d-flex flex-column">
                        <span class="fw-bold mb-3">{{ state.user.nickname }}</span>
                        <form @submit="createComment">
                        <textarea class="form-control mb-3" rows="3" placeholder="댓글을 입력해주세요." required
                                  style="resize: none" v-model="state.comment"></textarea>
                            <div class="d-flex justify-content-end">
                                <button type="submit" class="btn btn-info text-white">등록</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.title {
    word-break: break-all;
}
</style>