<template>
  <div class="app-layout">
    <div class="container">
      <AppHeader />
      
      <main class="main-content">
        <!-- Game Name Search Section -->
        <GameSearch @game-selected="onGameSelected" />

        <!-- Game Settings Section -->
        <GameSettings ref="gameSettings" :selected-game="selectedGame" />
      </main>
    </div>
    <!-- Footer Section -->
    <Footer />
  </div>
</template>

<script>
import GameSearch from './components/ui/GameSearch.vue'
import GameSettings from './components/ui/GameSettings.vue'
import Footer from './components/common/Footer.vue'
import AppHeader from './components/ui/AppHeader.vue'

export default {
  name: 'App',
  components: {
    GameSearch,
    GameSettings,
    Footer,
    AppHeader
  },
  data() {
    return {
      selectedGame: null
    }
  },
  methods: {
    onGameSelected(game) {
      this.selectedGame = game
      
      // Scroll to GameSettings component after a short delay to ensure it's rendered
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.gameSettings && this.$refs.gameSettings.$el) {
            this.$refs.gameSettings.$el.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
          }
        }, 100)
      })
    }
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
}</style>