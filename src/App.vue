<template>
  <div class="wrapper">
    <header class="header">
      <div class="header__logo">
        Panda Weather
      </div>
      <div class="header__langs">
        <div v-for="lang in locales" @click="changeLang(lang)" class="header__langs-item" v-bind:class="{'header__langs-active': locale == lang}">
          {{lang}}
        </div>
      </div>
    </header>
    <div class="tabs_wrap">
      <router-link :to="{name: 'main'}" v-bind:class="{'active': router.currentRoute.value.name == 'main'}">
          {{ t('Main') }}
      </router-link>

      <router-link :to="{name: 'favorites'}"  v-bind:class="{'active': router.currentRoute.value.name == 'favorites'}">
          {{ t('Favorites') }}
      </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script setup>
const router = useRouter()

const { t, locale } = useI18n({ useScope: 'global' })

const locales = ['uk', 'en']

function changeLang(lang){
    localStorage.setItem('lang', lang)
    locale.value = lang
    return{t, locale}
}
</script>