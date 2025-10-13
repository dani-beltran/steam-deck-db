import axios from 'axios'

/**
 * Backend API Service
 */
class ApiService {
  constructor() {
    // Use localhost in development, production URL otherwise
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:3001/v1'
      // TODO change to production URL
      : 'https://7vyclhz7.run.nodescript.dev'
  }

  /**
   * Search for game settings by game ID
   * @param {string|number} gameId - The Steam game ID
   * @returns {Promise<Object>} - The game settings data or processing status
   * @throws {Error} - Throws error with appropriate message for different error types
   */
  async searchSettings(gameId) {
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
}


// Export a singleton instance
export default new ApiService()