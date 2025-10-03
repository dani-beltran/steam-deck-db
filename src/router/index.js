import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GamePage from '../views/GamePage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/game/:gameId',
    name: 'Game',
    component: GamePage,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router