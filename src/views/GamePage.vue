<template>
  <div class="game-page">
    <!-- Back to Home Button -->
    <div class="navigation">
      <button @click="goBack" class="back-button" aria-label="Go back to home">
        ← Back to Search
      </button>
    </div>

    <!-- Game Settings Section -->
    <section aria-label="Game Settings" class="settings-section">
      <GameSettings :selected-game="selectedGame" />
    </section>
  </div>
</template>

<script>
import GameSettings from '../components/ui/GameSettings.vue'

export default {
  name: 'GamePage',
  components: {
    GameSettings
  },
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selectedGame: null
    }
  },
  created() {
    // Create a game object from the route parameter
    // In a real app, you might fetch game details from an API
    this.selectedGame = {
      id: this.gameId,
      name: null // Will be populated by the GameSettings component if available
    }
    
    // Update document title
    this.updateDocumentTitle()
  },
  watch: {
    gameId(newGameId) {
      // Update selected game when route parameter changes
      this.selectedGame = {
        id: newGameId,
        name: null
      }
      this.updateDocumentTitle()
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'Home' })
    },
    
    updateDocumentTitle() {
      const gameTitle = this.selectedGame?.name || `Game ID: ${this.gameId}`
      document.title = `${gameTitle} - Steam Deck Settings DB`
    }
  }
}
</script>

<style scoped>
.game-page {
  width: 100%;
}

.navigation {
  margin-bottom: 20px;
}

.back-button {
  background: var(--primary-color-start);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-button:hover {
  background: var(--primary-color-end);
  transform: translateY(-1px);
}

.back-button:focus {
  outline: 2px solid var(--primary-color-start);
  outline-offset: 2px;
}

.settings-section {
  margin-top: 20px;
}
</style>