<template>
  <div class="app-layout">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div class="container">
      <AppHeader />
      
      <main class="main-content">
        <!-- Game Name Search Section -->
        <section aria-label="Game Search" class="search-section">
          <GameSearch @game-selected="onGameSelected" />
        </section>

        <!-- Game Settings Section -->
        <section aria-label="Game Settings" class="settings-section">
          <GameSettings ref="gameSettings" :selected-game="selectedGame" />
        </section>
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
      
      // Only scroll to GameSettings component on narrow devices (mobile/tablet)
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.gameSettings && this.$refs.gameSettings.$el) {
            // Check if the screen width is narrow (768px or less)
            const isNarrowDevice = window.innerWidth <= 768
            
            if (isNarrowDevice) {
              this.$refs.gameSettings.$el.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              })
            }
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

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #667eea;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  z-index: 1000;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
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