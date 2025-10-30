import axios from 'axios'
import Cookies from 'js-cookie'

/**
 * Backend API Service
 */
class ApiService {
  constructor() {
    // Use localhost in development, production URL otherwise
    this.baseUrl = import.meta.env.DEV
      ? 'http://localhost:3000'
      : 'https://api.deckudb.com'
  }

  /**
   * Fetch deckudb game entry by game ID
   * @param {string|number} gameId - The Steam game ID
   * @returns {Promise<Object>} - The game details data or processing status
   * @throws {Error} - Throws error with appropriate message for different error types
   */
  async fetchGame(gameId) {
    if (!gameId) {
      throw new Error('Game ID is required')
    }

    try {
      const { data } = await axios.get(
        `${this.baseUrl}/games/${encodeURIComponent(gameId)}`
      )
      return data;
    } catch (err) {
      console.error('Error fetching game settings:', err)

      // Handle different types of errors
      if (err.response && err.response.status === 404) {
        throw new Error('Game settings not found. This game may not have Steam Deck specific settings.')
      } else if (err.response && err.response.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else if (err.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your connection and try again.')
      } else {
        throw new Error('Failed to fetch game settings. Please try again.')
      }
    }
  }

  async fetchSteamGame(gameId) {
    if (!gameId) {
      throw new Error('Game ID is required')
    }

    try {
      const { data } = await axios.get(
        `${this.baseUrl}/steam/games/${encodeURIComponent(gameId)}`
      )
      return data;
    } catch (err) {
      console.error('Error fetching Steam game details:', err)
      throw new Error('Failed to fetch Steam game details. Please try again.')
    }
  }

  async searchSteamGamesByName(term, limit = 10) {
    if (!term) {
      throw new Error('Search term is required')
    }

    try {
      const searchUrl = `${this.baseUrl}/steam/games?term=${encodeURIComponent(term)}&limit=${limit}`
      const { data } = await axios.get(searchUrl)
      return data;
    } catch (err) {
      console.error('Error searching for games:', err)
      throw new Error('Failed to search for games. Please try again.')
    }
  }

  /**
   * Fetch most played Steam Deck games
   * @returns {Promise<Object>} - Object containing array of games
   * @throws {Error} - Throws error if request fails
   */
  async fetchMostPlayedGames() {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/steam/most-played-steam-deck-games`
      )
      return data;
    } catch (err) {
      console.error('Error fetching most played games:', err)
      throw new Error('Failed to fetch most played games. Please try again.')
    }
  }

  async fetchAuthUser() {
    try {
      const { data } = await axios.get(`${this.baseUrl}/auth/user`, { withCredentials: true })
      return data;
    } catch (err) {
      console.error('Error fetching authenticated user:', err)
      throw new Error('Failed to fetch authenticated user. Please try again.')
    }
  }

  loginWithSteam() {
    Cookies.set('login_referer', window.location.href);
    window.location.href = `${this.baseUrl}/auth/steam`;
  }

  logout() {
    Cookies.set('logout_referer', window.location.href);
    window.location.href = `${this.baseUrl}/auth/logout`;
  }

  submitVote(gameId, voteType) {
    try {
      if (!gameId) {
        throw new Error('Game ID is required to submit a vote')
      }
      if (!['up', 'down'].includes(voteType)) {
        throw new Error('Invalid vote type. Must be "up" or "down"')
      }

      return axios.post(
        `${this.baseUrl}/games/${gameId}/vote`,
        { vote: voteType },
        { withCredentials: true }
      )
    } catch (err) {
      console.error('Error submitting vote:', err)
      throw new Error('Failed to submit vote. Please try again.')
    }
  }
}


// Export a singleton instance
export default new ApiService()