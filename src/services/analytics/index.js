/**
 * Analytics service exports
 * 
 * This file provides a clean interface for importing analytics functions
 */

export {
  trackSearch,
  trackSearchInput,
  trackSuggestionSelect,
  trackGameSelect,
  trackSearchResults,
  trackSearchError,
  trackShowMoreSearchResults as trackShowMoreResults,
  trackTabClick,
  trackCustomEvent
} from './analytics.js'