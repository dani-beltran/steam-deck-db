<template>
  <div class="tab-component">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        v-for="tab in availableTabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        <component 
          v-if="tab.icon" 
          :is="tab.icon" 
          :size="18" 
          class="tab-icon"
        />
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.count !== undefined" class="tab-count">({{ tab.count }})</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <slot :activeTab="activeTab"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabComponent',
  props: {
    tabs: {
      type: Array,
      required: true,
      validator(tabs) {
        return tabs.every(tab => 
          tab.hasOwnProperty('id') && 
          tab.hasOwnProperty('label')
        )
      }
    },
    defaultTab: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      activeTab: null
    }
  },
  computed: {
    availableTabs() {
      return this.tabs.filter(tab => !tab.hidden && (tab.count === undefined || tab.count > 0))
    }
  },
  watch: {
    tabs: {
      handler() {
        this.initializeActiveTab()
      },
      immediate: true,
      deep: true
    },
    defaultTab: {
      handler() {
        this.initializeActiveTab()
      }
    }
  },
  methods: {
    initializeActiveTab() {
      // Use the provided default tab if it exists and is available
      if (this.defaultTab && this.availableTabs.some(tab => tab.id === this.defaultTab)) {
        this.activeTab = this.defaultTab
        return
      }
      
      // Otherwise, use the first available tab
      if (this.availableTabs.length > 0) {
        this.activeTab = this.availableTabs[0].id
      } else {
        this.activeTab = null
      }
    },
    setActiveTab(tabId) {
      this.activeTab = tabId
      this.$emit('tab-changed', tabId)
    }
  }
}
</script>

<style scoped>
.tab-component {
  width: 100%;
}

/* Tab Navigation Styles */
.tab-navigation {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
  gap: 4px;
}

.tab-button {
  background: transparent;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-button:hover {
  color: #374151;
  background: #f9fafb;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f8faff;
}

.tab-count {
  background: #e5e7eb;
  color: #6b7280;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: #667eea;
  color: white;
}

.tab-content {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .tab-navigation {
    flex-wrap: wrap;
    gap: 2px;
  }

  .tab-button {
    padding: 10px 16px;
    font-size: 0.9rem;
    flex: 1;
    min-width: 0;
    text-align: center;
  }

  .tab-label {
    display: none;
  }

  .tab-count {
    font-size: 0.7rem;
  }
}
</style>