<template>
  <div class="game-settings">
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

    <!-- Game Information Section -->
    <section v-if="results && !loading" class="game-info-section" aria-label="Game information">
      <h2>Steam Deck Optimization Settings for {{ selectedGame ? selectedGame.name : `Game ID: ${gameId}` }}</h2>
      
      <!-- Game Rating and Verification -->
      <div class="game-badges">
        <div v-if="results.steamdeck_rating" class="rating-badge" :class="`rating-${results.steamdeck_rating}`">
          Steam Deck Rating: {{ results.steamdeck_rating.toUpperCase() }}
        </div>
        <div v-if="results.steamdeck_verified" class="verified-badge">
          ✓ Steam Deck Verified
        </div>
        <div v-if="results.proton_version" class="proton-badge">
          Proton: {{ results.proton_version }}
        </div>
      </div>

      <!-- Game Performance Summary -->
      <div v-if="results.game_performance_summary" class="summary-section">
        <h3>Performance Summary</h3>
        <p class="summary-text">{{ results.game_performance_summary }}</p>
      </div>

      <!-- Game Review Summary -->
      <div v-if="results.game_review_summary" class="summary-section">
        <h3>Game Overview</h3>
        <p class="summary-text">{{ results.game_review_summary }}</p>
      </div>
    </section>

    <!-- Settings Configurations -->
    <section v-if="results && results.settings && results.settings.length > 0 && !loading" class="settings-section" aria-label="Game settings configurations">
      <h3 v-if="results.settings.length > 1">Settings Configurations ({{ results.settings.length }} available)</h3>
      
      <div v-for="(config, index) in results.settings" :key="index" class="settings-config">
        <div v-if="results.settings.length > 1" class="config-header">
          <h4>Configuration {{ index + 1 }}</h4>
          <div class="config-meta">
            <span v-if="config.steamdeck_hardware" class="hardware-badge">{{ config.steamdeck_hardware.toUpperCase() }}</span>
            <span v-if="config.posted_at" class="date-badge">{{ formatDate(config.posted_at) }}</span>
          </div>
        </div>
        
        <TabComponent 
          :tabs="getSettingsTabsForConfig(config)"
          @tab-changed="onTabChanged"
        >
          <template #default="{ activeTab }">
            <!-- Game Settings Table -->
            <div v-if="activeTab === 'game' && getFlattenedGameSettings(config).length > 0">
              <PropertiesTable :data="getFlattenedGameSettings(config)" :key-prefix="`game-${index}`" />
            </div>
            
            <!-- Steam Deck Settings Table -->
            <div v-if="activeTab === 'steamdeck' && getFlattenedSteamDeckSettings(config).length > 0">
              <PropertiesTable :data="getFlattenedSteamDeckSettings(config)" :key-prefix="`steamdeck-${index}`" />
            </div>

            <!-- Battery Performance Table -->
            <div v-if="activeTab === 'battery' && getFlattenedBatteryPerformance(config).length > 0">
              <PropertiesTable :data="getFlattenedBatteryPerformance(config)" :key-prefix="`battery-${index}`" />
            </div>
          </template>
        </TabComponent>
      </div>
    </section>

    <!-- Processing Warning -->
    <ProcessingWarning 
      v-if="processingWarning"
      :game-name="selectedGame ? selectedGame.name : `ID: ${gameId}`"
      @dismiss="clearProcessingWarning"
    />

    <!-- No Results -->
    <div v-if="searchPerformed && !results && !loading && !error && !processingWarning" class="no-results">
      <p>No settings found for {{ selectedGame ? selectedGame.name : `game ID: ${gameId}` }}</p>
    </div>

    <!-- No Settings Data -->
    <div v-if="searchPerformed && results && (!results.settings || results.settings.length === 0) && !loading && !error && !processingWarning" class="no-results">
      <p>No optimization settings available for {{ selectedGame ? selectedGame.name : `game ID: ${gameId}` }}</p>
    </div>
  </div>
</template>

<script>
import nodescriptBE from '../../services/backend/nodescriptBE.js'
import PropertiesTable from '../common/PropertiesTable.vue'
import ProcessingWarning from './ProcessingWarning.vue'
import TabComponent from '../common/TabComponent.vue'
import ErrorMessage from '../common/ErrorMessage.vue'
import Spinner from '../base/Spinner.vue'
import { flattenObject } from '../../utils/objectUtils.js'
import { Gamepad2, Monitor, Battery } from 'lucide-vue-next'

export default {
  name: 'GameSettings',
  components: {
    PropertiesTable,
    ProcessingWarning,
    TabComponent,
    ErrorMessage,
    Spinner
  },
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

    onTabChanged(tabId) {
      // Handle tab change if needed
      // This could be used for analytics or other side effects
      console.log('Tab changed to:', tabId)
    },

    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      } catch {
        return dateString
      }
    },

    getFlattenedGameSettings(config) {
      if (!config || !config.game_settings) return []
      return flattenObject(config.game_settings)
    },

    getFlattenedSteamDeckSettings(config) {
      if (!config || !config.steamdeck_settings) return []
      return flattenObject(config.steamdeck_settings)
    },

    getFlattenedBatteryPerformance(config) {
      if (!config || !config.battery_performance) return []
      return flattenObject(config.battery_performance)
    },

    getSettingsTabsForConfig(config) {
      const gameSettings = this.getFlattenedGameSettings(config)
      const steamdeckSettings = this.getFlattenedSteamDeckSettings(config)
      const batteryPerformance = this.getFlattenedBatteryPerformance(config)
      
      return [
        {
          id: 'game',
          label: 'Game Settings',
          icon: Gamepad2,
          count: gameSettings.length,
          hidden: gameSettings.length === 0
        },
        {
          id: 'steamdeck',
          label: 'Steam Deck Settings',
          icon: Monitor,
          count: steamdeckSettings.length,
          hidden: steamdeckSettings.length === 0
        },
        {
          id: 'battery',
          label: 'Battery Performance',
          icon: Battery,
          count: batteryPerformance.length,
          hidden: batteryPerformance.length === 0
        }
      ]
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
.game-settings {
  width: 100%;
}

.game-info-section h2 {
  color: #374151;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.game-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
}

.rating-badge, .verified-badge, .proton-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.rating-badge.rating-gold {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #92400e;
}

.rating-badge.rating-platinum {
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
  color: #374151;
}

.rating-badge.rating-verified {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.rating-badge.rating-playable {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
}

.rating-badge.rating-unsupported {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
}

.verified-badge {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.proton-badge {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.summary-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border-left: 4px solid #6366f1;
}

.summary-section h3 {
  color: #374151;
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-text {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.settings-section {
  margin-top: 30px;
}

.settings-section > h3 {
  color: #374151;
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 600;
}

.settings-config {
  margin-bottom: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.config-header {
  background: #f9fafb;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-header h4 {
  color: #374151;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.config-meta {
  display: flex;
  gap: 10px;
}

.hardware-badge, .date-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.hardware-badge {
  background: #ddd6fe;
  color: #6d28d9;
}

.date-badge {
  background: #e0e7ff;
  color: #3730a3;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 1.1rem;
}

.error-with-top-margin {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .game-badges {
    flex-direction: column;
  }
  
  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .config-meta {
    align-self: stretch;
    justify-content: flex-start;
  }
}
</style>