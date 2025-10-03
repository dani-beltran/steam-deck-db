<template>
  <div class="game-page">
    <!-- Back to Home Button -->
    <div class="navigation">
      <button @click="goBack" class="back-button" aria-label="Go back to home">
        ← Back to Search
      </button>
    </div>

    <!-- Loading State -->
    <Spinner 
      v-if="loading" 
      message="Searching for game settings..."
    />

    <!-- Error State -->
    <ErrorMessage 
      :message="error"
      @dismiss="clearError"
      class="error-with-top-margin"
    />

    <!-- Game Description Section -->
    <GameDescription 
      :game-data="results"
      :selected-game="selectedGame"
      :loading="loading"
    />

    <!-- Game Settings Section -->
    <section aria-label="Game Settings" class="settings-section">
      <GameSettings 
        :results="results"
        :loading="loading"
        :error="error"
        :search-performed="searchPerformed"
        :processing-warning="processingWarning"
        @clear-processing-warning="clearProcessingWarning"
      />
    </section>

    <!-- Processing Warning -->
    <ProcessingWarning 
      v-if="processingWarning"
      :game-name="selectedGame ? selectedGame.name : `ID: ${gameId}`"
      @dismiss="clearProcessingWarning"
    />
  </div>
</template>

<script>
import GameSettings from '../components/ui/GameSettings.vue'
import GameDescription from '../components/ui/GameDescription.vue'
import ProcessingWarning from '../components/ui/ProcessingWarning.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import Spinner from '../components/base/Spinner.vue'
import nodescriptBE from '../services/backend/nodescriptBE.js'

export default {
  name: 'GamePage',
  components: {
    GameSettings,
    GameDescription,
    ProcessingWarning,
    ErrorMessage,
    Spinner
  },
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selectedGame: null,
      results: null,
      loading: false,
      error: null,
      searchPerformed: false,
      processingWarning: false
    }
  },
  created() {
    // Create a game object from the route parameter
    this.selectedGame = {
      id: this.gameId,
      name: null
    }
    
    // Update document title
    this.updateDocumentTitle()
    
    // Search for game settings
    this.searchSettings()
  },
  mounted() {
    // Add keyboard event listener for backspace key
    document.addEventListener('keydown', this.handleKeydown)
  },
  unmounted() {
    // Remove keyboard event listener to prevent memory leaks
    document.removeEventListener('keydown', this.handleKeydown)
  },
  watch: {
    gameId(newGameId) {
      // Update selected game when route parameter changes
      this.selectedGame = {
        id: newGameId,
        name: null
      }
      this.updateDocumentTitle()
      this.searchSettings()
    }
  },
  methods: {
    handleKeydown(event) {
      // Check if backspace key is pressed and not in an input field
      if (event.key === 'Backspace' && !this.isInInputField(event.target)) {
        event.preventDefault()
        this.goBack()
      }
    },
    
    isInInputField(target) {
      // Check if the target element is an input field where backspace should work normally
      const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT']
      return inputTypes.includes(target.tagName) || target.contentEditable === 'true'
    },
    
    goBack() {
      this.$router.push({ name: 'Home' })
    },
    
    clearError() {
      this.error = null
    },

    clearProcessingWarning() {
      this.processingWarning = false
    },
    
    updateDocumentTitle() {
      const gameTitle = this.selectedGame?.name || `Game ID: ${this.gameId}`
      document.title = `${gameTitle} - Steam Deck Settings DB`
    },

    async searchSettings() {
      if (!this.selectedGame || !this.selectedGame.id) {
        this.error = 'Please select a game first'
        return
      }

      this.loading = true
      this.error = null
      this.results = null
      this.searchPerformed = true
      this.processingWarning = false

      try {
        const result = await nodescriptBE.searchSettings(this.selectedGame.id)
        
        if (result.status === 'pending') {
          this.processingWarning = true
          return
        }
        
        this.results = result.data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
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

.error-with-top-margin {
  margin-top: 20px;
}
</style>