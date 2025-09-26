import axios from 'axios'

/**
 * Search for Steam games by name and return possible game IDs
 * @param {string} gameName - The name of the game to search for
 * @returns {Promise<Array>} Array of game objects with id, name, and other details
 */
export async function searchSteamGamesByName(gameName) {
  if (!gameName || typeof gameName !== 'string') {
    throw new Error('Game name must be a non-empty string')
  }

  try {
    // Steam doesn't have a direct search API, so we'll use the Steam store API
    // We'll search through the Steam spy API or use a combination approach
    
    // Method 1: Use Steam Store API search (requires CORS proxy)
    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&l=english&cc=US`
    
    // Since we can't directly call Steam API due to CORS, we'll use a CORS proxy
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    const fullUrl = proxyUrl + encodeURIComponent(searchUrl)
    
    const response = await axios.get(fullUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    })

    if (response.data && response.data.items) {
      return response.data.items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        price: item.price ? {
          currency: item.price.currency,
          initial: item.price.initial,
          final: item.price.final,
          discount_percent: item.price.discount_percent
        } : null,
        platforms: {
          windows: item.platforms?.windows || false,
          mac: item.platforms?.mac || false,
          linux: item.platforms?.linux || false
        },
        controller_support: item.controller_support,
        header_image: item.header_image,
        tiny_image: item.tiny_image,
        release_date: item.release_date
      }))
    }

    return []
  } catch (error) {
    console.error('Error searching Steam games:', error)
    
    // Fallback: Try alternative method using SteamSpy API
    try {
      return await searchUsingSteamSpy(gameName)
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError)
      throw new Error(`Failed to search for Steam games: ${error.message}`)
    }
  }
}

/**
 * Fallback search method using SteamSpy API
 * @param {string} gameName - The name of the game to search for
 * @returns {Promise<Array>} Array of game objects
 */
async function searchUsingSteamSpy(gameName) {
  try {
    // SteamSpy has a search endpoint but it's limited
    // We'll get all games and filter client-side (not ideal for large datasets)
    const response = await axios.get('https://steamspy.com/api.php?request=all', {
      timeout: 15000
    })

    if (response.data) {
      const games = Object.entries(response.data)
        .map(([appid, gameData]) => ({
          id: parseInt(appid),
          name: gameData.name,
          developer: gameData.developer,
          publisher: gameData.publisher,
          owners: gameData.owners,
          average_playtime: gameData.average_playtime,
          median_playtime: gameData.median_playtime,
          price: gameData.price,
          initialprice: gameData.initialprice,
          discount: gameData.discount,
          languages: gameData.languages,
          genre: gameData.genre,
          ccu: gameData.ccu,
          tags: gameData.tags
        }))
        .filter(game => 
          game.name && 
          game.name.toLowerCase().includes(gameName.toLowerCase())
        )
        .slice(0, 20) // Limit results

      return games
    }

    return []
  } catch (error) {
    console.error('SteamSpy search failed:', error)
    throw error
  }
}

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