<template>
  <section v-if="gameData && !loading" class="game-description" aria-label="Game information">
    <!-- Game Header with Title and Image -->
    <div class="game-header">
      <div class="game-image-container" v-if="gameImage">
        <a :href="steamStoreUrl" target="_blank" rel="noopener noreferrer" class="steam-link">
          <img :src="gameImage" :alt="`${gameTitle} cover image`" class="game-image" @error="onImageError" />
        </a>
      </div>
      <div class="game-title-section">
        <h2 class="game-title">
          <a :href="steamStoreUrl" target="_blank" rel="noopener noreferrer" class="steam-title-link">
            {{ gameTitle }}
          </a>
        </h2>

        <!-- Game Review Summary -->
        <div v-if="gameData.game_review_summary" class="summary-section">
          <p class="summary-text">{{ gameData.game_review_summary }}</p>
        </div>
      </div>
    </div>

    <!-- Game Rating and Verification -->
    <div class="game-badges">
      <Tooltip v-if="gameData.steamdeck_rating" :text="getRatingTooltip(gameData.steamdeck_rating)" position="top-right">
        <div class="rating-badge" :class="`rating-${gameData.steamdeck_rating}`">
          {{ gameData.steamdeck_rating.toUpperCase() }}
        </div>
      </Tooltip>
      <Tooltip v-if="gameData.steamdeck_verified" text="Steam Deck verified game">
        <div class="verified-badge">
          ✓ Verified
        </div>
      </Tooltip>
    </div>
    <!-- Quick link to settings -->
    <QuickLink href="#recommended-settings" target-id="recommended-settings" text="Check the Settings" />
  </section>
</template>

<script>
import QuickLink from "../common/QuickLink.vue";
import Tooltip from "../base/Tooltip.vue";

export default {
  name: "GameDescription",
  components: {
    QuickLink,
    Tooltip,
  },
  props: {
    gameData: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      gameImage: null,
      imageLoadError: false,
    };
  },
  computed: {
    gameTitle() {
      return this.gameData.game_name || `Game ID: ${this.gameId}`;
    },
    gameId() {
      return this.gameData?.game_id || "";
    },
    steamStoreUrl() {
      return this.gameId
        ? `https://store.steampowered.com/app/${this.gameId}/`
        : "#";
    },
  },
  watch: {
    gameData: {
      handler(newGame) {
        if (newGame?.game_id) {
          this.loadGameImage();
        }
      },
      immediate: true,
    },
  },
  methods: {
    getRatingTooltip(rating) {
      const tooltips = {
        native: "Game works natively on linux",
        gold: "Game works flawlessly after a few changes",
        platinum: "Game works flawlessly out of the box",
        unsupported: "Game is not supported"
      };
      return tooltips[rating] || "";
    },

    loadGameImage() {
      if (!this.gameId) return;

      // Steam's standard game image URL format
      // This uses Steam's official CDN for game header images
      this.gameImage = `https://cdn.akamai.steamstatic.com/steam/apps/${this.gameId}/header.jpg`;
      this.imageLoadError = false;
    },

    onImageError() {
      this.imageLoadError = true;
      this.gameImage = null;
    },
  },
};
</script>

<style scoped>
.game-description {
  width: 100%;
  margin-bottom: 30px;
}

.game-header {
  display: flex;
  gap: 40px;
  margin-bottom: 25px;
  align-items: flex-end;
}

.game-image-container {
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.game-image {
  width: 380px;
  height: 215px;
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease;
}

.game-image:hover {
  transform: scale(1.02);
}

.steam-link {
  display: block;
  text-decoration: none;
}

.steam-title-link {
  color: #374151;
  text-decoration: none;
  transition: color 0.2s ease;
}

.steam-title-link:hover {
  color: #1171d3;
  text-decoration: underline;
}

.game-title-section {
  flex: 1;
  min-width: 0;
}

.game-title {
  color: #374151;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  line-height: 1.3;
  font-weight: 600;
}

.game-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.rating-badge,
.verified-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.rating-badge.rating-gold {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #92400e;
}

.rating-badge.rating-platinum {
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
  color: #374151;
}

.rating-badge.rating-native {
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

.summary-section {
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

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 15px;
  }

  .game-image {
    width: 100%;
    max-width: 280px;
    height: auto;
    aspect-ratio: 280/130;
  }

  .game-title {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 1.2rem;
  }

  .game-image {
    width: 100%;
    max-width: 100%;
  }

  .summary-section {
    padding: 15px;
  }
}
</style>
