<template>
  <div class="search-section">
    <h2 class="search-title">Search by game</h2>
    <SearchBar
      v-model="gameName"
      placeholder="Enter game name..."
      :loading="gameSearchLoading"
      @search="searchGameByName"
      @input="onGameNameInput"
    />

    <!-- Game Search Results -->
    <div v-if="gameSearchResults.length > 0 && !gameSearchLoading" class="game-results">
      <h3>Found {{ gameSearchResults.length }} games:</h3>
      <div class="game-grid">
        <transition-group name="game-card" tag="div" class="game-grid-inner">
          <GameCard
            v-for="(game, index) in displayedResults" 
            :key="game.id"
            :game="game"
            :is-selected="selectedGameId === game.id"
            :animation-delay="index >= 5 ? (index - 5) * 0.1 : 0"
            @select="selectGame"
          />
        </transition-group>
      </div>
      
      <!-- Show More Button -->
      <transition name="show-more">
        <div v-if="hasMoreResults" class="show-more-container">
          <Button 
            @click="showAllResults = true" 
            variant="primary" 
            size="medium"
          >
            Show More ({{ gameSearchResults.length - 5 }} more games)
          </Button>
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
import { searchSteamGamesByName } from '../../services/steam/steamApi.js'
import ErrorMessage from '../common/ErrorMessage.vue'
import Spinner from '../base/Spinner.vue'
import GameCard from './GameCard.vue'
import Button from '../base/Button.vue'
import SearchBar from '../common/SearchBar.vue'

export default {
  name: 'GameSearch',
  components: {
    ErrorMessage,
    Spinner,
    GameCard,
    Button,
    SearchBar
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
      return this.gameSearchResults.slice(0, 5)
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

.show-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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


}

.error-with-top-margin {
  margin-top: 20px;
}
</style>