<template>
  <div class="container">
    <header class="header">
      <h1 class="title">SteamDeck game settings DB</h1>
    </header>
    
    <main class="main-content">
      <!-- Game Name Search Section -->
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
            <div 
              v-for="game in gameSearchResults" 
              :key="game.id"
              class="game-card"
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
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading || gameSearchLoading" class="loading">
        <div class="spinner"></div>
        <p v-if="loading">Searching for game settings...</p>
        <p v-if="gameSearchLoading">Searching for games...</p>
      </div>

      <!-- Error State -->
      <div v-if="error || gameSearchError" class="error">
        <p>{{ error || gameSearchError }}</p>
        <button @click="clearErrors" class="error-dismiss">Dismiss</button>
      </div>

      <!-- Results Table -->
      <div v-if="results && !loading" class="results-section">
        <h2>Game Settings for ID: {{ gameId }}</h2>
        <div class="table-container">
          <table class="results-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in flattenedResults" :key="row.key">
                <td class="property-cell">{{ row.key }}</td>
                <td class="value-cell">
                  <span v-if="typeof row.value === 'boolean'" :class="row.value ? 'boolean-true' : 'boolean-false'">
                    {{ row.value }}
                  </span>
                  <span v-else-if="typeof row.value === 'number'" class="number-value">
                    {{ row.value }}
                  </span>
                  <span v-else-if="row.value === null || row.value === undefined" class="null-value">
                    null
                  </span>
                  <span v-else>{{ row.value }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="searchPerformed && !results && !loading && !error" class="no-results">
        <p>No settings found for game ID: {{ gameId }}</p>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import { searchSteamGamesByName, getSteamGameDetails } from './steamApi.js'

export default {
  name: 'App',
  data() {
    return {
      gameId: '',
      gameName: '',
      results: null,
      loading: false,
      error: null,
      searchPerformed: false,
      gameSearchResults: [],
      gameSearchLoading: false,
      gameSearchError: null,
      selectedGame: null
    }
  },
  computed: {
    flattenedResults() {
      if (!this.results) return []
      return this.flattenObject(this.results)
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
      }
      if (this.gameSearchError) {
        this.gameSearchError = null
      }
    },

    selectGame(game) {
      this.selectedGame = game
      this.gameId = game.id.toString()
      this.gameName = game.name
      
      // Automatically search for settings when a game is selected
      this.searchSettings()
    },

    clearErrors() {
      this.error = null
      this.gameSearchError = null
    },

    async searchSettings() {
      if (!this.gameId.trim()) {
        this.error = 'Please enter a game ID'
        return
      }

      this.loading = true
      this.error = null
      this.results = null
      this.searchPerformed = true

      try {
        const response = await axios.get(`https://7vyclhz7.run.nodescript.dev/steamdeck?gameId=${encodeURIComponent(this.gameId)}`)
        this.results = response.data
      } catch (err) {
        console.error('Error fetching game settings:', err)
        if (err.response && err.response.status === 404) {
          this.error = 'Game not found. Please check the game ID and try again.'
        } else if (err.response && err.response.status >= 500) {
          this.error = 'Server error. Please try again later.'
        } else if (err.code === 'NETWORK_ERROR') {
          this.error = 'Network error. Please check your connection and try again.'
        } else {
          this.error = 'Failed to fetch game settings. Please try again.'
        }
      } finally {
        this.loading = false
      }
    },
    flattenObject(obj, parentKey = '', result = []) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = parentKey ? `${parentKey}.${key}` : key
          const value = obj[key]
          
          if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            // Recursively flatten nested objects
            this.flattenObject(value, newKey, result)
          } else {
            // Add the key-value pair to results
            result.push({
              key: newKey,
              value: Array.isArray(value) ? JSON.stringify(value) : value
            })
          }
        }
      }
      return result
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

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.error-dismiss {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}

.results-section h2 {
  color: #374151;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.results-table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.results-table td {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.results-table tr:nth-child(even) {
  background: #f9fafb;
}

.results-table tr:hover {
  background: #f3f4f6;
}

.property-cell {
  font-weight: 600;
  color: #374151;
  min-width: 200px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.value-cell {
  color: #6b7280;
  word-break: break-all;
}

.boolean-true {
  color: #059669;
  font-weight: 600;
}

.boolean-false {
  color: #dc2626;
  font-weight: 600;
}

.number-value {
  color: #7c3aed;
  font-weight: 600;
}

.null-value {
  color: #9ca3af;
  font-style: italic;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 1.1rem;
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

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .search-input, .search-button {
    padding: 16px 20px;
  }
  
  .container {
    padding: 16px;
  }
  
  .results-table th,
  .results-table td {
    padding: 12px;
    font-size: 0.9rem;
  }
  
  .property-cell {
    min-width: 150px;
  }

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
}
</style>