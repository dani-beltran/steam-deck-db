<template>
    <div class="game-image-container" v-if="gameImage">
        <a :href="steamStoreUrl" target="_blank" rel="noopener noreferrer" class="steam-link" @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave">
            <img v-show="!showTrailer" :src="gameImage" :alt="`${gameTitle} cover image`" class="game-image"
                @error="onImageError" />
            <video v-if="trailerUrl && showTrailer" :src="trailerUrl" class="game-trailer" autoplay muted loop
                playsinline></video>
        </a>
    </div>
</template>

<script>
import apiService from '../../services/backend/apiService.js'

export default {
    name: "GamePreview",
    props: {
        gameId: {
            type: [String, Number],
            required: true,
        },
        gameTitle: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            gameImage: null,
            imageLoadError: false,
            trailerUrl: null,
            showTrailer: false,
        };
    },
    computed: {
        steamStoreUrl() {
            return this.gameId
                ? `https://store.steampowered.com/app/${this.gameId}/`
                : "#";
        },
    },
    watch: {
        gameId: {
            handler(newId) {
                if (newId) {
                    this.loadGameImage();
                    this.loadTrailerUrl();
                }
            },
            immediate: true,
        },
    },
    methods: {
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

        async loadTrailerUrl() {
            if (!this.gameId) return;

            try {
                const gameData = await apiService.fetchSteamGame(this.gameId);
                if (!gameData) return;

                // Check if the game has movies (trailers)
                if (gameData.movies && gameData.movies.length > 0) {
                    // Get the first trailer's webm or mp4 URL
                    const trailer = gameData.movies[0];
                    if (trailer.webm && trailer.webm.max) {
                        this.trailerUrl = trailer.webm.max;
                    } else if (trailer.mp4 && trailer.mp4.max) {
                        this.trailerUrl = trailer.mp4.max;
                    }
                }

            } catch (error) {
                console.error('Error loading trailer:', error);
                this.trailerUrl = null;
            }
        },

        onMouseEnter() {
            if (this.trailerUrl) {
                this.showTrailer = true;
            }
        },

        onMouseLeave() {
            this.showTrailer = false;
        },
    },
};
</script>

<style scoped>
.game-image-container {
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
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

.game-trailer {
    width: 380px;
    height: 215px;
    display: block;
    background: #000;
}

.steam-link {
    display: block;
    text-decoration: none;
}

@media (max-width: 768px) {

    .game-image,
    .game-trailer {
        width: 100%;
        max-width: 280px;
        height: auto;
        aspect-ratio: 280/130;
    }
}

@media (max-width: 480px) {

    .game-image,
    .game-trailer {
        width: 100%;
        max-width: 100%;
    }
}
</style>
