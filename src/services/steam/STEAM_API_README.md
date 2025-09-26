# Steam API Functions

This project includes utility functions to search for Steam games by name and retrieve their IDs using the Steam API.

## Functions Available

### `searchSteamGamesByName(gameName)`

Searches for Steam games by name and returns possible game IDs.

**Parameters:**
- `gameName` (string): The name of the game to search for

**Returns:** 
- Promise<Array>: Array of game objects with id, name, and other details

**Example:**
```javascript
import { searchSteamGamesByName } from './src/steamApi.js'

const games = await searchSteamGamesByName('Half-Life')
console.log(games)
// Returns: [{ id: 70, name: "Half-Life", type: "game", ... }, ...]
```

### `getSteamGameDetails(gameId)`

Gets detailed information about a specific Steam game by ID.

**Parameters:**
- `gameId` (string|number): The Steam app ID

**Returns:**
- Promise<Object>: Detailed game information

**Example:**
```javascript
import { getSteamGameDetails } from './src/steamApi.js'

const details = await getSteamGameDetails('220')
console.log(details.name) // "Half-Life 2"
```

### `searchExactGameName(gameName)`

Searches for games with exact name match.

**Parameters:**
- `gameName` (string): Exact game name to search for

**Returns:**
- Promise<Array>: Array of exactly matching games

### `suggestSteamGames(partialName, limit)`

Suggests Steam games based on partial name matching (autocomplete-like functionality).

**Parameters:**
- `partialName` (string): Partial game name
- `limit` (number, optional): Maximum number of suggestions (default: 10)

**Returns:**
- Promise<Array>: Array of suggested games sorted by relevance

## Usage in the App

The main application (`App.vue`) now includes:

1. **Game Name Search**: Enter a game name to find matching Steam games
2. **Game Selection**: Click on a game from the search results to automatically populate the game ID
3. **Game ID Search**: Manually enter a game ID or use the one from game selection
4. **Settings Display**: View the Steam Deck settings for the selected game

## API Limitations and Fallbacks

Due to CORS restrictions with Steam's direct API, the functions use:

1. **Primary Method**: CORS proxy with Steam Store API for real-time search
2. **Fallback Method**: SteamSpy API for broader game database access

## Error Handling

All functions include comprehensive error handling:
- Network timeouts
- API rate limiting
- Invalid responses
- CORS issues
- Fallback mechanisms

## Example Usage

See `src/examples.js` for complete usage examples including:
- Basic game search
- Detailed game information retrieval
- Exact name matching
- Autocomplete suggestions
- Complete workflow examples