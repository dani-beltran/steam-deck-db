import axios from 'axios'

/**
 * Get detailed information about a specific Steam game by ID
 * @param {string|number} gameId - The Steam app ID
 * @returns {Promise<Object>} Game details object
 */
export async function getSteamGameDetails(gameId) {
  if (!gameId) {
    throw new Error('Game ID is required')
  }

  try {
    const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${gameId}&l=english`
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    const fullUrl = proxyUrl + encodeURIComponent(detailsUrl)

    const response = await axios.get(fullUrl, {
      timeout: 10000
    })

    if (response.data && response.data[gameId]) {
      const gameData = response.data[gameId]
      
      if (gameData.success && gameData.data) {
        return {
          id: gameData.data.steam_appid,
          name: gameData.data.name,
          type: gameData.data.type,
          description: gameData.data.detailed_description,
          short_description: gameData.data.short_description,
          developers: gameData.data.developers,
          publishers: gameData.data.publishers,
          platforms: gameData.data.platforms,
          categories: gameData.data.categories,
          genres: gameData.data.genres,
          release_date: gameData.data.release_date,
          header_image: gameData.data.header_image,
          website: gameData.data.website,
          pc_requirements: gameData.data.pc_requirements,
          mac_requirements: gameData.data.mac_requirements,
          linux_requirements: gameData.data.linux_requirements,
          price_overview: gameData.data.price_overview,
          achievements: gameData.data.achievements,
          controller_support: gameData.data.controller_support
        }
      }
    }

    throw new Error('Game not found or invalid response')
  } catch (error) {
    console.error('Error fetching game details:', error)
    throw new Error(`Failed to fetch game details: ${error.message}`)
  }
}

/**
 * Search for games with exact name match (more precise search)
 * @param {string} gameName - Exact game name to search for
 * @returns {Promise<Array>} Array of exactly matching games
 */
export async function searchExactGameName(gameName) {
  const allResults = await searchSteamGamesByName(gameName)
  
  return allResults.filter(game => 
    game.name.toLowerCase() === gameName.toLowerCase()
  )
}

/**
 * Suggest Steam games based on partial name matching
 * @param {string} partialName - Partial game name
 * @param {number} limit - Maximum number of suggestions (default: 10)
 * @returns {Promise<Array>} Array of suggested games
 */
export async function suggestSteamGames(partialName, limit = 10) {
  const allResults = await searchSteamGamesByName(partialName)
  
  return allResults
    .sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.name.toLowerCase().startsWith(partialName.toLowerCase())
      const bExact = b.name.toLowerCase().startsWith(partialName.toLowerCase())
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // Then sort by name length (shorter names first)
      return a.name.length - b.name.length
    })
    .slice(0, limit)
}