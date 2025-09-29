<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click')"
    :type="type"
  >
    <slot>
      <!-- Default content if no slot is provided -->
      {{ label }}
    </slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'search'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'button'
    },
    label: {
      type: String,
      default: ''
    }
  },
  emits: ['click'],
  computed: {
    buttonClasses() {
      return [
        'btn',
        `btn-${this.variant}`,
        `btn-${this.size}`,
        {
          'btn-disabled': this.disabled
        }
      ]
    }
  }
}
</script>

<style scoped>
.btn {
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  outline: none;
}

.btn:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

.btn-primary:hover:not(.btn-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:active:not(.btn-disabled) {
  transform: translateY(0);
}

.btn-search {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0 12px 12px 0;
}

.btn-search:hover:not(.btn-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.btn-secondary:hover:not(.btn-disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Sizes */
.btn-small {
  padding: 8px 16px;
  font-size: 0.875rem;
}

.btn-medium {
  padding: 12px 24px;
  font-size: 0.9rem;
}

.btn-large {
  padding: 20px 24px;
  font-size: 1.1rem;
}

/* Disabled state */
.btn-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}
</style>