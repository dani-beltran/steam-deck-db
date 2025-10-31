
<template>
  <div>
    <div style="margin-bottom: 0.5em; font-weight: 500;">
      <template v-if="user">Were the recommendations useful?</template>
      <template v-else>Sign in to provide feedback</template>
    </div>
    <div class="thumbs-rating">
    <button
      class="thumb-btn up"
      :class="{ active: userVote === 'up' }"
      @click="vote('up')"
      aria-label="Thumbs up"
      :disabled="!user"
    >
      <ThumbsUp class="icon" />
      <span class="count">{{ thumbsUp }}</span>
    </button>
    <button
      class="thumb-btn down"
      :class="{ active: userVote === 'down' }"
      @click="vote('down')"
      aria-label="Thumbs down"
      :disabled="!user"
    >
      <ThumbsDown class="icon" />
      <span class="count">{{ thumbsDown }}</span>
    </button>
    </div>
  </div>
</template>

<script>
import { ThumbsUp, ThumbsDown } from 'lucide-vue-next';
export default {
  name: 'ThumbsRating',
  components: {
    ThumbsUp,
    ThumbsDown
  },
  props: {
    user: {
      type: Object,
      default: null
    },
    game: {
      type: Object,
      required: true
    }
  },
  computed: {
    userVote() {
      if (!this.user || !this.user.deckuProfile || !this.user.deckuProfile.votes) {
        return null;
      }
      return this.user.deckuProfile.votes.find(vote => vote.game_id === this.game.game_id)?.vote_type || null;
    },
    thumbsDown() {
      if (this.userVote === 'down') {
        return (this.game.thumbs_down ?? 0) + 1;
      }
      return this.game.thumbs_down ?? 0;
    },
    thumbsUp() {
      if (this.userVote === 'up') {
        return (this.game.thumbs_up ?? 0) + 1;
      }
      return this.game.thumbs_up ?? 0;
    }
  },
  emits: ['vote'],
  methods: {
    vote(type) {
      this.$emit('vote', this.userVote === type ? null : type);
    }
  }
};
</script>

<style scoped>
.thumbs-rating {
  display: flex;
  align-items: center;
  gap: 16px;
}
.thumb-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #606060;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background 0.2s, color 0.2s;
}

.thumb-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #b0b0b0;
}
.thumb-btn .icon {
  width: 24px;
  height: 24px;
  margin-right: 6px;
  fill: currentColor;
}
.thumb-btn.up.active,
.thumb-btn.up:hover {
  background: #e8f0fe;
  color: #1967d2;
}
.thumb-btn.down.active,
.thumb-btn.down:hover {
  background: #fbe9e7;
  color: #d23f31;
}
.count {
  min-width: 24px;
  text-align: right;
  font-weight: 500;
}
</style>
