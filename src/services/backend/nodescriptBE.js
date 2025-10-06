import axios from 'axios'

/**
 * Nodescript Backend Service
 * Handles API calls to the Nodescript backend for Steam Deck game settings
 */
class NodescriptBEService {
  constructor() {
    this.baseUrl = 'https://7vyclhz7.run.nodescript.dev'
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
      const { data: resBody } = await axios.get(
        `${this.baseUrl}/steamdeck/game-settings?game_id=${encodeURIComponent(gameId)}`
      )
      
      if (resBody.status === 'pending') {
        return {
          status: 'pending',
          message: 'Settings are being processed'
        }
      }
      
      return {
        status: 'success',
        data: resBody.data
      }
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

  async searchSteamGamesByName(term) {
    if (!term) {
      throw new Error('Search term is required')
    }

    try {
      const searchUrl = `https://7vyclhz7.run.nodescript.dev/steamdeck/search-games?query=${encodeURIComponent(term)}`
      const { data } = await axios.get(searchUrl)
      return data;
    } catch (err) {
      console.error('Error searching for games:', err)
      throw new Error('Failed to search for games. Please try again.')
    }
  }
}


// Export a singleton instance
export default new NodescriptBEService()