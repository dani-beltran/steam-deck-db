<template>
  <div class="game-settings">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Searching for game settings...</p>
    </div>

    <!-- Error State -->
    <ErrorMessage 
      :message="error"
      @dismiss="clearError"
      class="error-with-top-margin"
    />

    <!-- Platinum/Native Game Alert -->
    <PlatinumAlert 
      v-if="isPlatinumOrNative && results && !loading"
      :is-platinum="results.is_platinum"
      :is-native="results.is_native"
    />

    <!-- Results Tabs -->
    <div v-if="results && !loading" class="results-section">
      <h2>Recommended settings for {{ selectedGame ? selectedGame.name : `ID: ${gameId}` }}</h2>
      
      <TabComponent 
        :tabs="settingsTabs"
        @tab-changed="onTabChanged"
      >
        <template #default="{ activeTab }">
          <!-- Game Settings Table -->
          <div v-if="activeTab === 'game' && flattenedGameSettings.length > 0">
            <SettingsTable :data="flattenedGameSettings" key-prefix="game" />
          </div>
          
          <!-- Launch Configuration Table -->
          <div v-if="activeTab === 'launch' && flattenedLaunchConfiguration.length > 0">
            <SettingsTable :data="flattenedLaunchConfiguration" key-prefix="launch" />
          </div>

          <!-- Steam Deck Settings Table -->
          <div v-if="activeTab === 'steamdeck' && flattenedSteamDeckSettings.length > 0">
            <SettingsTable :data="flattenedSteamDeckSettings" key-prefix="steamdeck" />
          </div>
        </template>
      </TabComponent>
    </div>

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
  </div>
</template>

<script>
import nodescriptBE from '../services/nodescriptBE.js'
import SettingsTable from './SettingsTable.vue'
import ProcessingWarning from './ProcessingWarning.vue'
import TabComponent from './TabComponent.vue'
import ErrorMessage from './ErrorMessage.vue'
import PlatinumAlert from './PlatinumAlert.vue'
import { flattenObject } from '../utils/objectUtils.js'

export default {
  name: 'GameSettings',
  components: {
    SettingsTable,
    ProcessingWarning,
    TabComponent,
    ErrorMessage,
    PlatinumAlert
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
    },
    isPlatinumOrNative() {
      return this.results && (this.results.is_platinum === true || this.results.is_native === true)
    },
    flattenedLaunchConfiguration() {
      if (!this.results || !this.results.launch_configuration) return []
      return flattenObject(this.results.launch_configuration)
    },
    flattenedSteamDeckSettings() {
      if (!this.results || !this.results.steamdeck_settings) return []
      return flattenObject(this.results.steamdeck_settings)
    },
    flattenedGameSettings() {
      if (!this.results || !this.results.game_settings) return []
      return flattenObject(this.results.game_settings)
    },
    settingsTabs() {
      return [
        {
          id: 'game',
          label: 'Game Settings',
          count: this.flattenedGameSettings.length,
          hidden: this.flattenedGameSettings.length === 0
        },
        {
          id: 'launch',
          label: 'Launch Configuration',
          count: this.flattenedLaunchConfiguration.length,
          hidden: this.flattenedLaunchConfiguration.length === 0
        },
        {
          id: 'steamdeck',
          label: 'Steam Deck Settings',
          count: this.flattenedSteamDeckSettings.length,
          hidden: this.flattenedSteamDeckSettings.length === 0
        }
      ]
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
        
        this.results = result.data?.settings
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

.results-section h2 {
  color: #374151;
  margin-bottom: 20px;
  font-size: 1.5rem;
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
</style>