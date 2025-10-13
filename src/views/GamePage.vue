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
      :game-name="gameTitle"
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
import apiService from '../services/backend/apiService.js'

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
      results: null,
      loading: false,
      error: null,
      searchPerformed: false,
      processingWarning: false
    }
  },
  computed: {
    gameTitle() {
      return this.results?.game_name || `Game ID: ${this.gameId}`
    }
  },
  mounted() {
    // Add keyboard event listener for backspace key
    document.addEventListener('keydown', this.handleKeydown)
    this.updateDocumentTitle()
    this.searchSettings()
  },
  unmounted() {
    // Remove keyboard event listener to prevent memory leaks
    document.removeEventListener('keydown', this.handleKeydown)
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
      document.title = `${this.gameTitle} - Steam Deck Settings DB`
    },

    async searchSettings() {
      if (!this.gameId) {
        this.error = 'Unknown game ID.'
        return
      }

      this.loading = true
      this.error = null
      this.results = null
      this.searchPerformed = true
      this.processingWarning = false

      try {
        const result = await apiService.searchSettings(this.gameId)
        
        if (result.status === 'queued') {
          this.processingWarning = true
          return
        }
        
        this.results = result.game
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