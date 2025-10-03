<template>
  <div class="home">
    <HomeHeader />
    <!-- Game Name Search Section -->
    <section aria-label="Game Search" class="search-section">
      <GameSearch @game-selected="onGameSelected" />
    </section>
  </div>
</template>

<script>
import GameSearch from '../components/ui/GameSearch.vue'
import HomeHeader from '../components/ui/HomeHeader.vue'

export default {
  name: 'Home',
  components: {
    GameSearch,
    HomeHeader
  },
  created() {
    // Set document title for home page
    document.title = 'Steam Deck Settings DB - Game Optimization Settings'
  },
  methods: {
    onGameSelected(game) {
      // Navigate to the game page
      this.$router.push({
        name: 'Game',
        params: { gameId: game.id }
      })
    }
  }
}
</script>

<style scoped>
.home {
  width: 100%;
}

.search-section {
  margin-bottom: 30px;
}
</style>