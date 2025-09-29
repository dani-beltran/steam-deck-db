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
    <div 
      class="tab-content-container"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseEnd"
      @mouseleave="onMouseEnd"
    >
      <div 
        class="tab-content-wrapper"
        :style="{ transform: `translateX(${swipeState.translateX}px)` }"
        :class="{ 
          'transitioning': swipeState.isTransitioning,
          'hidden': !isContentVisible 
        }"
      >
        <div class="tab-content-panel active">
          <slot :activeTab="activeTab"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useSwipe } from '../../composables/swipe/useSwipe.js'

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
  emits: ['tab-changed'],
  setup(props, { emit }) {
    // Component state
    const activeTab = ref(null)
    const isContentVisible = ref(true)
    
    // Computed properties
    const availableTabs = computed(() => {
      return props.tabs.filter(tab => !tab.hidden && (tab.count === undefined || tab.count > 0))
    })
    
    const currentTabIndex = computed(() => {
      return availableTabs.value.findIndex(tab => tab.id === activeTab.value)
    })
    
    // Initialize swipe composable
    const animationDuration = 400
    const {
      swipeState,
      resetSwipeState,
      animateToPosition,
      resetPosition,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleMouseDown,
      handleMouseMove,
      handleMouseEnd
    } = useSwipe({
      swipeThreshold: 50,
      velocityThreshold: 0.3,
      maxDragDistance: 0.25,
      edgeResistance: 0.2,
      animationDuration
    })
    
    // Tab management methods
    const initializeActiveTab = () => {
      // Use the provided default tab if it exists and is available
      if (props.defaultTab && availableTabs.value.some(tab => tab.id === props.defaultTab)) {
        activeTab.value = props.defaultTab
        return
      }
      
      // Otherwise, use the first available tab
      if (availableTabs.value.length > 0) {
        activeTab.value = availableTabs.value[0].id
      } else {
        activeTab.value = null
      }
    }
    
    const setActiveTab = (tabId) => {
      if (swipeState.isDragging || swipeState.isTransitioning) return
      
      resetSwipeState()
      isContentVisible.value = true // Ensure content is visible when clicking tabs
      activeTab.value = tabId
      emit('tab-changed', tabId)
    }
    
    // Animation methods
    const animateToTab = (tabIndex) => {
      const newTab = availableTabs.value[tabIndex]
      const currentIndex = currentTabIndex.value
      
      animateToPosition(() => {
        // Animate slide out
        if (tabIndex > currentIndex) {
          swipeState.translateX = -window.innerWidth * 1
        } else {
          swipeState.translateX = window.innerWidth * 1
        }
        
        // After sliding out, change tab and slide back in
        setTimeout(() => {
          isContentVisible.value = false
          swipeState.translateX = 0
          activeTab.value = newTab.id
          emit('tab-changed', newTab.id)
        }, animationDuration / 2)

        // Show content after sliding in and chaging tab
        setTimeout(() => {
          isContentVisible.value = true
        }, animationDuration)
      })
    }
    
    // Swipe event handlers
    const onTouchStart = (e) => {
      handleTouchStart(e)
    }
    
    const onTouchMove = (e) => {
      handleTouchMove(e, currentTabIndex.value, availableTabs.value.length)
    }
    
    const onTouchEnd = (e) => {
      const result = handleTouchEnd(currentTabIndex.value, availableTabs.value.length)
      handleSwipeResult(result)
    }
    
    const onMouseDown = (e) => {
      handleMouseDown(e)
    }
    
    const onMouseMove = (e) => {
      handleMouseMove(e, currentTabIndex.value, availableTabs.value.length)
    }
    
    const onMouseEnd = (e) => {
      const result = handleMouseEnd(currentTabIndex.value, availableTabs.value.length)
      handleSwipeResult(result)
    }
    
    const handleSwipeResult = (result) => {
      if (!result) return
      if (result.type === 'change') {
        animateToTab(result.newIndex)
      } else if (result.type === 'reset') {
        resetPosition()
      }
    }
    
    // Watchers
    watch([() => props.tabs, () => props.defaultTab], () => {
      initializeActiveTab()
    }, { immediate: true, deep: true })
    
    return {
      // State
      activeTab,
      availableTabs,
      swipeState,
      isContentVisible,
      
      // Methods
      setActiveTab,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseEnd
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

.tab-content-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  touch-action: pan-y; /* Allow vertical scrolling but handle horizontal swipes */
  margin-top: 20px;
  user-select: none; /* Prevent text selection during swipe */
}

.tab-content-wrapper {
  width: 100%;
  transition: opacity .4s ease;
  opacity: 1;
  will-change: transform;
  cursor: grab;
}

.tab-content-wrapper:active {
  cursor: grabbing;
}

.tab-content-wrapper.transitioning {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.tab-content-wrapper.hidden {
  opacity: 0;
  pointer-events: none;
}

.tab-content-panel {
  width: 100%;
}

.tab-content-panel.active {
  opacity: 1;
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

  .tab-button.active {
    flex: 3;
  }

  .tab-label {
    display: none;
  }

  .tab-button.active .tab-label {
    display: inline;
  }

  .tab-count {
    display: none;
  }
}
</style>