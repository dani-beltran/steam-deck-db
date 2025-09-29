<template>
  <div class="container">
    <header class="header">
      <h1 class="title">SteamDeck game settings DB</h1>
    </header>
    
    <main class="main-content">
      <!-- Game Name Search Section -->
      <GameSearch @game-selected="onGameSelected" />

      <!-- Game Settings Section -->
      <GameSettings ref="gameSettings" :selected-game="selectedGame" />
    </main>
  </div>
</template>

<script>
import GameSearch from './components/ui/GameSearch.vue'
import GameSettings from './components/ui/GameSettings.vue'

export default {
  name: 'App',
  components: {
    GameSearch,
    GameSettings
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
* {
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .container {
    padding: 16px;
  }
}
</style>