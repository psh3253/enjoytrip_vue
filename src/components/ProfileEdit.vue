<script setup>
import {computed, onMounted, reactive} from "vue";
import axios from "axios";
import store from "@/store";
import router from "@/router";

const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;

const state = reactive({
    user: {},
    file: null,
    imageUrl: '',
    password: '',
    newPassword: '',
    newPasswordConfirm: '',
    withdrawPassword: '',
    announce: '',
    announceColor: ''
})

const accessToken = computed(() => store.state.accessToken);

onMounted(async () => {
    if(accessToken.value === null) {
        alert('로그인 후 이용해주세요.');
        await router.push('/login');
        return;
    }

    await axios.get('/users/me', {}).then((response) => {
        if (response.status === 200) {
            state.user = response.data;
        }
    }).catch((error) => {
        console.log(error);
    })

})

async function changeFile(event) {
    const fileDOM = document.querySelector('#file');
    const preview = document.querySelector('.image-box');
    state.file = fileDOM.files[0];
    console.log(state.file);

    const reader = new FileReader();
    reader.onload = ({ target }) => {
        preview.src = target.result;
    };
    reader.readAsDataURL(state.file);
}



async function changeProfileImage() {
    const formData = new FormData();
    formData.append('file', state.file);

    await axios.patch('/users/profile-image', formData, {
        headers: {
                'Content-Type': 'multipart/form-data',
                'Access-Control-Allow-Origin': '*'
            }
    }).then((response) => {
        if (response.status === 200) {
            console.log("image changed");
            alert("프로필 사진이 수정되었습니다.");
            loadData();
        }
    }).catch((error) => {
        console.log(error);
    })
}

async function changeNickname() {
    await axios.patch('/users/profile-nickname', {}, {
            params: {
                nickname: state.user.nickname
            },
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
    }).then((response) => {
        if (response.status === 200) {
            console.log("nickname changed");
            alert("닉네임이 수정되었습니다.");
            loadData();
        }
    }).catch((error) => {
        console.log(error);
    })
}

function checkPassword() {
    if (state.newPassword.length === 0 || state.newPasswordConfirm.length === 0) {
        state.announce = "";
        return;
    }
    if (state.newPassword === state.newPasswordConfirm) {
        state.announce = "비밀번호 확인이 일치합니다.";
        state.announceColor = "green";
    } else {
        state.announce = "비밀번호 확인이 일치하지 않습니다.";
        state.announceColor = "red";
    }
}

async function changePassword() {
    if (state.newPassword === state.newPasswordConfirm) {
        await axios.patch('/users/change-password', {}, {
            params: {
                password: state.password,
                newPassword: state.newPassword,
            },
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
    }).then((response) => {
        if (response.status === 200) {
            console.log("password changed");
            alert("비밀번호가 수정되었습니다.");
            loadData();
        }
    }).catch((error) => {
        console.log(error);
    })
    } else {
        alert("error")
    }
}

async function withdraw() {
    await axios.delete('/users/', {
        params: {
            password: state.withdrawPassword
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }).then((response) => {
        if (response.status === 200) {
            console.log("withdraw user");
            alert("회원탈퇴 되었습니다.");
            logout();
        }
    }).catch((error) => {
        console.log(error);
    })
}

function logout() {
    store.commit('logout');
    router.push('/');
}

</script>

<template>
    <div class="d-flex justify-content-center">
        <div class="d-flex flex-column">
            <h1 class="fw-bold mt-5 mb-3 text-center">프로필 수정</h1>
            <div>
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active custom-color" id="image-tab" data-bs-toggle="tab"
                                data-bs-target="#image-tab-pane" type="button" role="tab"
                                aria-controls="image-tab-pane" aria-selected="false">이미지 수정
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link custom-color" id="post-tab" data-bs-toggle="tab"
                                data-bs-target="#nickname-tab-pane" type="button" role="tab"
                                aria-controls="nickname-tab-pane" aria-selected="true">닉네임 수정
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link custom-color" id="password-tab" data-bs-toggle="tab"
                                data-bs-target="#password-tab-pane" type="button" role="tab"
                                aria-controls="password-tab-pane" aria-selected="false">비밀번호 변경
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link custom-color" id="withdraw-tab" data-bs-toggle="tab"
                                data-bs-target="#withdraw-tab-pane" type="button" role="tab"
                                aria-controls="withdraw-tab-pane" aria-selected="false">회원탈퇴
                        </button>
                    </li>
                    
                </ul>
            </div>
            <div class="tab-content" id="myTabContent"><br/>
                <!-- 이미지 수정 -->
                <div class="tab-pane fade show active" id="image-tab-pane" role="tabpanel"
                        aria-labelledby="image-tab" tabindex="0">
                    <div class="mb-3">
                        <div class="text-center">
                            <img :src="`${apiBaseUrl}/users/images/${state.user.imageFileName}`"
                                class="image-box rounded border border-2 border-dark img-thumbnail" width="400" height="400" alt="" >
                        </div>
                        <br>
                        <input type="file" id="file" class="form-control" accept="image/*"
                            @change="changeFile" required/>
                    </div>
                    <div class="mb-3">
                        <input type="submit" value="수정"
                            class="btn btn-info text-white container-fluid" @click="changeProfileImage()">
                    </div>
                </div>
                <!-- 닉네임 수정 -->
                <div class="tab-pane fade" id="nickname-tab-pane" role="tabpanel"
                        aria-labelledby="nickname-tab" tabindex="1">
                    <div class="mb-3">
                        <label for="nickname" class="form-label">닉네임</label>
                        <input type="text" class="form-control" v-model="state.user.nickname" size="30" required/>
                    </div>
                    <div class="mb-3">
                        <input type="submit" value="수정"
                            class="btn btn-info text-white container-fluid" @click="changeNickname()">
                    </div>
                </div>
                <!-- 비밀번호 수정 -->
                <div class="tab-pane fade" id="password-tab-pane" role="tabpanel" aria-labelledby="password-tab"
                        tabindex="2">
                    <div class="mb-3">
                        <label for="password" class="form-label">현재 비밀번호</label>
                        <input type="password" class="form-control" v-model="state.password" size="30" required/>
                    </div>
                    <div class="mb-3">
                        <label for="new-password" class="form-label">새 비밀번호</label>
                        <input type="password" class="form-control" v-model="state.newPassword" size="30" @blur="checkPassword" required/>
                    </div>
                    <div class="mb-3">
                        <label for="new-password-confirm" class="form-label">새 비밀번호 확인</label>
                        <input type="password" class="form-control" v-model="state.newPasswordConfirm" @blur="checkPassword"
                            size="30" required/>
                    </div>
                    <div class="mb-3 text-warn" id="announce" :style="{color: state.announceColor}">{{
                            state.announce
                        }}
                    </div>
                    <div class="mb-3">
                        <input type="submit" id="change-button" value="변경" class="btn btn-info text-white container-fluid" @click="changePassword()">
                    </div>
                </div>
                <!-- 회원탈퇴 -->
                <div class="tab-pane fade" id="withdraw-tab-pane" role="tabpanel" aria-labelledby="withdraw-tab"
                        tabindex="3">
                    <div class="mb-3">
                        <label for="withdraw-password" class="form-label">비밀번호</label>
                        <input type="password" class="form-control" v-model="state.withdrawPassword" size="30" required/>
                    </div>
                    <div class="mb-3">
                        <input type="submit" id="withdraw-user" value="탈퇴하기" class="btn btn-danger container-fluid" @click="withdraw()">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.nav-link.active {
    color: #6c757d;
}

.nav-link:not(.active) {
    color: #0dcaf0;
}

td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>