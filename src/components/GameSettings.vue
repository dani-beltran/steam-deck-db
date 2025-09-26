<template>
  <div class="game-settings">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Searching for game settings...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="clearError" class="error-dismiss">Dismiss</button>
    </div>

    <!-- Results Table -->
    <div v-if="results && !loading" class="results-section">
      <h2>Game Settings for {{ selectedGame ? selectedGame.name : `ID: ${gameId}` }}</h2>
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

    <!-- Processing Warning -->
    <div v-if="processingWarning" class="processing-warning">
      <div class="warning-icon">⏳</div>
      <h3>Settings Being Processed</h3>
      <p>The game settings for {{ selectedGame ? selectedGame.name : `ID: ${gameId}` }} are still being processed.</p>
      <p>Please check back in a few minutes.</p>
      <button @click="clearProcessingWarning" class="warning-dismiss">Dismiss</button>
    </div>

    <!-- No Results -->
    <div v-if="searchPerformed && !results && !loading && !error && !processingWarning" class="no-results">
      <p>No settings found for {{ selectedGame ? selectedGame.name : `game ID: ${gameId}` }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'GameSettings',
  props: {
    selectedGame: {
      type: Object,
      default: null
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
    gameId() {
      return this.selectedGame ? this.selectedGame.id.toString() : ''
    },
    flattenedResults() {
      if (!this.results) return []
      return this.flattenObject(this.results)
    }
  },
  watch: {
    selectedGame: {
      handler(newGame) {
        if (newGame) {
          this.searchSettings()
        }
      },
      immediate: true
    }
  },
  methods: {
    clearError() {
      this.error = null
    },

    clearProcessingWarning() {
      this.processingWarning = false
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
        const { data: resBody } = await axios.get(`https://7vyclhz7.run.nodescript.dev/steamdeck/game-settings?gameId=${encodeURIComponent(this.selectedGame.id)}`)
        if (resBody.status === 'pending') {
          this.processingWarning = true
          return
        }
        this.results = resBody.data
      } catch (err) {
        console.error('Error fetching game settings:', err)
        if (err.response && err.response.status === 404) {
          this.error = 'Game settings not found. This game may not have Steam Deck specific settings.'
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
.game-settings {
  width: 100%;
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

.processing-warning {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  color: #92400e;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.processing-warning h3 {
  color: #92400e;
  margin: 0 0 12px 0;
  font-size: 1.2rem;
}

.processing-warning p {
  margin: 8px 0;
}

.warning-dismiss {
  background: #d97706;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 12px;
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

@media (max-width: 768px) {
  .results-table th,
  .results-table td {
    padding: 12px;
    font-size: 0.9rem;
  }
  
  .property-cell {
    min-width: 150px;
  }
}
</style>