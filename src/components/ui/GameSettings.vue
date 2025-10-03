<template>
  <div class="game-settings">
    <!-- Settings Configurations -->
    <section v-if="results && results.settings && results.settings.length > 0 && !loading" class="settings-section" aria-label="Game settings configurations">
      <div v-if="results.settings.length > 1" class="settings-header">
        <h3>Recommended Settings Configuration</h3>
        
        <!-- Hardware Filter Badges -->
        <div v-if="hasMultipleHardwareTypes" class="hardware-filter">
          <span class="filter-label">Filter by Steam Deck:</span>
          <button 
            :class="['hardware-filter-badge', 'lcd', { active: selectedHardware === 'lcd' }]"
            @click="filterByHardware('lcd')"
          >
            LCD
          </button>
          <button 
            :class="['hardware-filter-badge', 'oled', { active: selectedHardware === 'oled' }]"
            @click="filterByHardware('oled')"
          >
            OLED
          </button>
        </div>
      </div>
      
      <div v-for="(config, index) in filteredSettings" :key="index" class="settings-config">
        <div v-if="filteredSettings.length > 1" class="config-header">
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

    <!-- No Results -->
    <div v-if="searchPerformed && !results && !loading && !error && !processingWarning" class="no-results">
      <p>No settings found for {{ gameTitle }}</p>
    </div>

    <!-- No Settings Data -->
    <div v-if="searchPerformed && results && (!results.settings || results.settings.length === 0) && !loading && !error && !processingWarning" class="no-results">
      <p>No optimization settings available for {{ gameTitle }}</p>
    </div>
  </div>
</template>

<script>
import PropertiesTable from '../common/PropertiesTable.vue'
import TabComponent from '../common/TabComponent.vue'
import { flattenObject } from '../../utils/objectUtils.js'
import { Gamepad2, Monitor, Battery } from 'lucide-vue-next'

export default {
  name: 'GameSettings',
  components: {
    PropertiesTable,
    TabComponent
  },
  props: {
    results: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    searchPerformed: {
      type: Boolean,
      default: false
    },
    processingWarning: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedHardware: 'lcd'
    }
  },
  computed: {
    gameTitle() {
      return this.results.game_name || `Game ID: ${this.results.id}`
    },
    
    filteredSettings() {
      if (!this.results || !this.results.settings) return []
      
      return this.results.settings.filter(config => {
        const hardware = config.steamdeck_hardware?.toLowerCase()
        
        if (this.selectedHardware === 'lcd') {
          // Show LCD configurations and those with null/undefined hardware
          return hardware === 'lcd' || !hardware
        }
        
        return hardware === this.selectedHardware
      })
    },
    
    hasMultipleHardwareTypes() {
      if (!this.results || !this.results.settings) return false
      
      const hardwareTypes = new Set(
        this.results.settings
          .map(config => config.steamdeck_hardware?.toLowerCase())
          .filter(Boolean)
      )
      
      return hardwareTypes.size > 1
    }
  },
  watch: {
    results: {
      handler() {
        // Reset filter when new results are loaded
        this.selectedHardware = 'lcd'
      },
      immediate: true
    }
  },
  methods: {
    filterByHardware(hardware) {
      this.selectedHardware = hardware
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
          label: 'SteamOS Settings',
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
    }
  }
}
</script>

<style scoped>
.game-settings {
  width: 100%;
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

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.settings-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.3rem;
  font-weight: 600;
}

.hardware-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 4px;
}

.hardware-filter-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 2px solid transparent;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.hardware-filter-badge:hover {
  background: #e5e7eb;
  color: #374151;
}

.hardware-filter-badge.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.hardware-filter-badge.oled.active {
  background: #8b5cf6;
  border-color: #7c3aed;
}

.hardware-filter-badge.lcd.active {
  background: #06b6d4;
  border-color: #0891b2;
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
  .settings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .hardware-filter {
    align-self: stretch;
    justify-content: flex-start;
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