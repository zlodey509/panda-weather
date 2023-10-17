import { createRouter, createWebHistory } from 'vue-router'

const MainPage = () => import('../views/Main.vue')
const FavoritesPage = () => import('../views/Favorites.vue')

const router = createRouter({
  history: createWebHistory(),
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainPage
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesPage
    }
  ]
})

export default router