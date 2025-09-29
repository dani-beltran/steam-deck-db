<template>
  <div class="search-container">
    <div class="input-wrapper">
      <input 
        v-model="searchTerm" 
        type="text" 
        :placeholder="placeholder" 
        class="search-input"
        @keyup.enter="handleSearch"
        @input="handleInput"
      />
      <Button 
        @click="handleSearch" 
        variant="search" 
        size="large"
        :disabled="loading"
      >
        <Search class="search-icon" />
      </Button>
    </div>
  </div>
</template>

<script>
import { Search } from 'lucide-vue-next'
import Button from '../base/Button.vue'

export default {
  name: 'SearchBar',
  components: {
    Button,
    Search
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Enter search term...'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'search', 'input'],
  computed: {
    searchTerm: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchTerm)
    },
    
    handleInput() {
      this.$emit('input', this.searchTerm)
    }
  }
}
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 600px;
}

.input-wrapper {
  display: flex;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 20px 24px;
  border: 2px solid #e5e7eb;
  font-size: 1.1rem;
  outline: none;
  transition: all 0.2s ease;
  border-radius: 12px 0 0 12px;
  border-right: none;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-icon {
  width: 24px;
  height: 24px;
  color: white;
}

@media (max-width: 768px) {
  .search-input {
    padding: 16px 20px;
  }
}
</style>