<template>
  <div 
    class="game-card"
    :class="{ 'game-card-selected': isSelected }"
    :style="{ '--animation-delay': animationDelay + 's' }"
    @click="$emit('select', game)"
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
</template>

<script>
export default {
  name: 'GameCard',
  props: {
    game: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    animationDelay: {
      type: Number,
      default: 0
    }
  },
  emits: ['select']
}
</script>

<style scoped>
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

@media (max-width: 768px) {
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