<template>
  <div class="search-section">
    <h2 class="search-title">Search by game</h2>
    <div class="search-wrapper">
      <SearchBar
        v-model="gameName"
        placeholder="Enter Steam game name..."
        :loading="gameSearchLoading"
        @search="searchGameByName"
        @input="onGameNameInput"
        @keydown="handleKeyDown"
        @blur="hideSuggestions"
        @focus="showSuggestions = suggestions.length > 0"
        aria-label="Search for Steam Deck game settings"
      />
      
      <!-- Suggestions Dropdown -->
      <SearchSuggestions
        :suggestions="suggestions"
        :show="showSuggestions"
        :loading="suggestionsLoading"
        :selected-index="selectedSuggestionIndex"
        title="Game Suggestions"
        @select-suggestion="selectSuggestion"
        @update-selected-index="selectedSuggestionIndex = $event"
      />
    </div>

    <!-- Game Search Results -->
    <div v-if="gameSearchResults.length > 0 && !gameSearchLoading" class="game-results" role="region" aria-label="Search results">
      <h3>Found {{ gameSearchResults.length }} Steam games:</h3>
      <div class="game-grid" role="list" aria-label="List of Steam games with available settings">
        <transition-group name="game-card" tag="div" class="game-grid-inner">
          <GameCard
            v-for="(game, index) in displayedResults" 
            :key="game.id"
            :game="game"
            :is-selected="selectedGameId === game.id"
            :animation-delay="index >= this.INITIAL_RESULTS_COUNT ? (index - this.INITIAL_RESULTS_COUNT) * 0.1 : 0"
            @select="selectGame"
            role="listitem"
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
            Show More ({{ gameSearchResults.length - this.INITIAL_RESULTS_COUNT }} more games)
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
import { searchSteamGamesByName, suggestSteamGames } from '../../services/steam/steamApi.js'
import ErrorMessage from '../common/ErrorMessage.vue'
import Spinner from '../base/Spinner.vue'
import GameCard from './GameCard.vue'
import Button from '../base/Button.vue'
import SearchBar from '../common/SearchBar.vue'
import SearchSuggestions from '../common/SearchSuggestions.vue'

export default {
  name: 'GameSearch',
  components: {
    ErrorMessage,
    Spinner,
    GameCard,
    Button,
    SearchBar,
    SearchSuggestions
  },
  emits: ['game-selected'],
  data() {
    return {
      gameName: '',
      gameSearchResults: [],
      gameSearchLoading: false,
      gameSearchError: null,
      selectedGameId: null,
      showAllResults: false,
      INITIAL_RESULTS_COUNT: 4,
      suggestions: [],
      suggestionsLoading: false,
      showSuggestions: false,
      selectedSuggestionIndex: -1,
      debounceTimer: null
    }
  },
  computed: {
    displayedResults() {
      if (this.showAllResults || this.gameSearchResults.length <= this.INITIAL_RESULTS_COUNT) {
        return this.gameSearchResults
      }
      return this.gameSearchResults.slice(0, this.INITIAL_RESULTS_COUNT)
    },
    hasMoreResults() {
      return this.gameSearchResults.length > this.INITIAL_RESULTS_COUNT && !this.showAllResults
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
      
      // Trigger suggestions with debouncing
      this.debouncedFetchSuggestions()
    },

    debouncedFetchSuggestions() {
      // Clear existing timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      
      // If input is empty, hide suggestions
      if (!this.gameName.trim()) {
        this.suggestions = []
        this.showSuggestions = false
        this.selectedSuggestionIndex = -1
        return
      }
      
      // Set new timer for 300ms delay
      this.debounceTimer = setTimeout(() => {
        this.fetchSuggestions()
      }, 300)
    },

    async fetchSuggestions() {
      if (!this.gameName.trim() || this.gameName.trim().length < 2) {
        this.suggestions = []
        this.showSuggestions = false
        return
      }

      this.suggestionsLoading = true
      
      try {
        const suggestions = await suggestSteamGames(this.gameName.trim(), 8)
        this.suggestions = suggestions
        this.showSuggestions = suggestions.length > 0
        this.selectedSuggestionIndex = -1
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        this.suggestions = []
        this.showSuggestions = false
      } finally {
        this.suggestionsLoading = false
      }
    },

    selectSuggestion(suggestion) {
      this.gameName = suggestion.name
      this.suggestions = []
      this.showSuggestions = false
      this.selectedSuggestionIndex = -1
      // Trigger search immediately when suggestion is selected
      this.searchGameByName()
    },

    handleKeyDown(event) {
      if (!this.showSuggestions || this.suggestions.length === 0) return
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          this.selectedSuggestionIndex = Math.min(
            this.selectedSuggestionIndex + 1,
            this.suggestions.length - 1
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          this.selectedSuggestionIndex = Math.max(
            this.selectedSuggestionIndex - 1,
            -1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (this.selectedSuggestionIndex >= 0) {
            this.selectSuggestion(this.suggestions[this.selectedSuggestionIndex])
          } else {
            this.searchGameByName()
          }
          break
        case 'Escape':
          this.suggestions = []
          this.showSuggestions = false
          this.selectedSuggestionIndex = -1
          break
      }
    },

    hideSuggestions() {
      // Add a small delay to allow for suggestion clicks
      setTimeout(() => {
        this.showSuggestions = false
        this.selectedSuggestionIndex = -1
      }, 150)
    },

    selectGame(game) {
      this.gameName = game.name
      this.selectedGameId = game.id
      this.$emit('game-selected', game)
    },

    clearError() {
      this.gameSearchError = null
    }
  },
  beforeUnmount() {
    // Clean up debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
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

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
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