/**
 * Quick test file to verify Steam API functions work
 * Run this in the browser console to test the functions
 */

import { searchSteamGamesByName } from './steamApi.js'

// Quick test function
window.testSteamAPI = async function() {
  console.log('Testing Steam API...')
  
  try {
    // Test with a popular game
    const results = await searchSteamGamesByName('Portal')
    console.log('✅ Steam API test successful!')
    console.log(`Found ${results.length} games:`)
    
    results.slice(0, 3).forEach(game => {
      console.log(`- ${game.name} (ID: ${game.id})`)
    })
    
    return results
  } catch (error) {
    console.error('❌ Steam API test failed:', error.message)
    return null
  }
}

console.log('Test function loaded. Run testSteamAPI() in console to test.')