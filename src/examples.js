/**
 * Example usage of Steam API functions
 * This file demonstrates how to use the Steam game search functions
 */

import { 
  searchSteamGamesByName, 
  getSteamGameDetails, 
  searchExactGameName, 
  suggestSteamGames 
} from './steamApi.js'

// Example 1: Basic search by game name
async function basicSearch() {
  try {
    const games = await searchSteamGamesByName('Half-Life')
    console.log('Found games:', games)
    
    // Extract just the IDs and names
    const gameList = games.map(game => ({
      id: game.id,
      name: game.name
    }))
    
    console.log('Game IDs and names:', gameList)
    return gameList
  } catch (error) {
    console.error('Search failed:', error.message)
  }
}

// Example 2: Get detailed information about a specific game
async function getGameDetails() {
  try {
    const gameDetails = await getSteamGameDetails('220') // Half-Life 2
    console.log('Game details:', gameDetails)
    return gameDetails
  } catch (error) {
    console.error('Failed to get game details:', error.message)
  }
}

// Example 3: Search for exact game name matches
async function exactSearch() {
  try {
    const exactMatches = await searchExactGameName('Portal 2')
    console.log('Exact matches:', exactMatches)
    return exactMatches
  } catch (error) {
    console.error('Exact search failed:', error.message)
  }
}

// Example 4: Get game suggestions (autocomplete-like functionality)
async function getGameSuggestions() {
  try {
    const suggestions = await suggestSteamGames('Counter', 5) // Get 5 suggestions
    console.log('Suggestions for "Counter":', suggestions)
    return suggestions
  } catch (error) {
    console.error('Suggestions failed:', error.message)
  }
}

// Example 5: Complete workflow - search, select, get details
async function completeWorkflow(searchTerm) {
  try {
    console.log(`\n=== Searching for: "${searchTerm}" ===`)
    
    // Step 1: Search for games
    const games = await searchSteamGamesByName(searchTerm)
    console.log(`Found ${games.length} games`)
    
    if (games.length === 0) {
      console.log('No games found!')
      return
    }
    
    // Step 2: Display first few results
    console.log('\nTop 3 results:')
    games.slice(0, 3).forEach((game, index) => {
      console.log(`${index + 1}. ${game.name} (ID: ${game.id})`)
    })
    
    // Step 3: Get details for the first game
    if (games[0]) {
      console.log(`\n=== Getting details for: "${games[0].name}" ===`)
      try {
        const details = await getSteamGameDetails(games[0].id)
        console.log('Release date:', details.release_date?.date)
        console.log('Developers:', details.developers)
        console.log('Genres:', details.genres?.map(g => g.description).join(', '))
        console.log('Platforms:', Object.keys(details.platforms || {}).filter(p => details.platforms[p]).join(', '))
      } catch (detailsError) {
        console.log('Could not fetch details:', detailsError.message)
      }
    }
    
    return games
  } catch (error) {
    console.error('Workflow failed:', error.message)
  }
}

// Export functions for use in other files
export {
  basicSearch,
  getGameDetails,
  exactSearch,
  getGameSuggestions,
  completeWorkflow
}

// If running this file directly (for testing), uncomment below:
// completeWorkflow('Portal')
// completeWorkflow('Grand Theft Auto')
// completeWorkflow('Cyberpunk')