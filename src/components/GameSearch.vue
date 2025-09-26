<template>
  <div class="search-section">
    <h2 class="search-title">Search by Game Name</h2>
    <div class="search-container">
      <div class="input-wrapper">
        <input 
          v-model="gameName" 
          type="text" 
          placeholder="Enter game name..." 
          class="search-input"
          @keyup.enter="searchGameByName"
          @input="onGameNameInput"
        />
        <button @click="searchGameByName" class="search-button" :disabled="gameSearchLoading">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Game Search Results -->
    <div v-if="gameSearchResults.length > 0 && !gameSearchLoading" class="game-results">
      <h3>Found {{ gameSearchResults.length }} games:</h3>
      <div class="game-grid">
        <transition-group name="game-card" tag="div" class="game-grid-inner">
          <div 
            v-for="(game, index) in displayedResults" 
            :key="game.id"
            class="game-card"
            :class="{ 'game-card-selected': selectedGameId === game.id }"
            :style="{ '--animation-delay': (index >= 5 ? (index - 5) * 0.1 : 0) + 's' }"
            @click="selectGame(game)"
          >
            <img 
              v-if="game.tiny_image || game.header_image" 
              :src="game.tiny_image || game.header_image" 
              :alt="game.name"
              class="game-image"
              @error="$event.target.style.display = 'none'"
            />
            <div class="game-info">
              <h4 class="game-name">{{ game.name }}</h4>
              <p class="game-id">ID: {{ game.id }}</p>
              <div class="game-platforms" v-if="game.platforms">
                <span v-if="game.platforms.windows" class="platform">Windows</span>
                <span v-if="game.platforms.mac" class="platform">Mac</span>
                <span v-if="game.platforms.linux" class="platform">Linux</span>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
      
      <!-- Show More Button -->
      <transition name="show-more">
        <div v-if="hasMoreResults" class="show-more-container">
          <button @click="showAllResults = true" class="show-more-button">
            Show More ({{ gameSearchResults.length - 5 }} more games)
          </button>
        </div>
      </transition>
    </div>

    <!-- Loading State -->
    <Spinner 
      v-if="gameSearchLoading" 
      message="Searching for games..."
    />

    <!-- Error State -->
    <ErrorMessage 
      :message="gameSearchError"
      @dismiss="clearError"
      class="error-with-top-margin"
    />
  </div>
</template>

<script>
import { searchSteamGamesByName } from '../services/steam/steamApi.js'
import ErrorMessage from './ErrorMessage.vue'
import Spinner from './Spinner.vue'

export default {
  name: 'GameSearch',
  components: {
    ErrorMessage,
    Spinner
  },
  emits: ['game-selected'],
  data() {
    return {
      gameName: '',
      gameSearchResults: [],
      gameSearchLoading: false,
      gameSearchError: null,
      selectedGameId: null,
      showAllResults: false
    }
  },
  computed: {
    displayedResults() {
      if (this.showAllResults || this.gameSearchResults.length <= 5) {
        return this.gameSearchResults
      }
      return this.gameSearchResults.slice(0, 6)
    },
    hasMoreResults() {
      return this.gameSearchResults.length > 5 && !this.showAllResults
    }
  },
  methods: {
    async searchGameByName() {
      if (!this.gameName.trim()) {
        this.gameSearchError = 'Please enter a game name'
        return
      }

      this.gameSearchLoading = true
      this.gameSearchError = null
      this.gameSearchResults = []
      this.selectedGameId = null
      this.showAllResults = false

      try {
        const games = await searchSteamGamesByName(this.gameName.trim())
        this.gameSearchResults = games
        
        if (games.length === 0) {
          this.gameSearchError = 'No games found with that name. Try a different search term.'
        }
      } catch (err) {
        console.error('Error searching for games:', err)
        this.gameSearchError = `Failed to search for games: ${err.message}`
      } finally {
        this.gameSearchLoading = false
      }
    },

    onGameNameInput() {
      // Clear previous search results when user starts typing
      if (this.gameSearchResults.length > 0) {
        this.gameSearchResults = []
        this.selectedGameId = null
        this.showAllResults = false
      }
      if (this.gameSearchError) {
        this.gameSearchError = null
      }
    },

    selectGame(game) {
      this.gameName = game.name
      this.selectedGameId = game.id
      this.$emit('game-selected', game)
    },

    clearError() {
      this.gameSearchError = null
    }
  }
}
</script>

<style scoped>
.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.search-title {
  color: #374151;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
}

.search-container {
  width: 100%;
  max-width: 600px;
}

.input-wrapper {
  display: flex;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 20px 24px;
  border: 2px solid #e5e7eb;
  font-size: 1.1rem;
  outline: none;
  transition: all 0.2s ease;
  border-radius: 12px 0 0 12px;
  border-right: none;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-button {
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0 12px 12px 0;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.search-icon {
  width: 24px;
  height: 24px;
  color: white;
}

/* Game Search Results Styles */
.game-results {
  margin-top: 30px;
  width: 100%;
  max-width: 800px;
}

.game-results h3 {
  color: #374151;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.game-grid-inner {
  display: contents;
}

/* Animation styles for game cards */
.game-card-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-delay: var(--animation-delay, 0s);
}

.game-card-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.9);
}

.game-card-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.game-card-leave-active {
  transition: all 0.3s ease;
}

.game-card-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.game-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.game-card-selected {
  border-color: #4f46e5 !important;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2), 0 8px 25px rgba(79, 70, 229, 0.3) !important;
  transform: translateY(-2px);
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
}

.game-card-selected:hover {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3), 0 12px 35px rgba(79, 70, 229, 0.4) !important;
}

.game-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.game-info {
  flex: 1;
  min-width: 0;
}

.game-name {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-id {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.game-platforms {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.platform {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.platform:nth-child(1) {
  background: #dbeafe;
  color: #1d4ed8;
}

.platform:nth-child(2) {
  background: #dcfce7;
  color: #166534;
}

.platform:nth-child(3) {
  background: #fef3c7;
  color: #92400e;
}

.show-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.show-more-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.show-more-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.show-more-button:active {
  transform: translateY(0);
}

/* Show More button transition animations */
.show-more-enter-active {
  transition: all 0.4s ease;
}

.show-more-leave-active {
  transition: all 0.3s ease;
}

.show-more-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.show-more-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@media (max-width: 768px) {
  .search-title {
    font-size: 1.3rem;
  }

  .game-grid {
    grid-template-columns: 1fr;
  }

  .game-card {
    padding: 12px;
  }

  .game-image {
    width: 40px;
    height: 40px;
  }

  .game-name {
    font-size: 0.9rem;
  }

  .search-input, .search-button {
    padding: 16px 20px;
  }
}

.error-with-top-margin {
  margin-top: 20px;
}
</style>