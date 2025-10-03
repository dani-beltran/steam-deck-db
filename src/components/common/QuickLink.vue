<template>
  <div class="quick-links">
    <a :href="href" class="settings-link" @click="handleClick">
      <span class="arrow-icon">↓</span> {{ text }}
    </a>
  </div>
</template>

<script>
export default {
  name: 'QuickLink',
  props: {
    href: {
      type: String,
      required: true
    },
    text: {
      type: String,
      default: 'Jump to Settings'
    },
    targetId: {
      type: String,
      required: true
    }
  },
  methods: {
    handleClick(event) {
      event.preventDefault()
      const element = document.getElementById(this.targetId)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }
}
</script>

<style scoped>
.quick-links {
  margin-top: 10px;
  display: none; /* Hidden by default on desktop */
}

.settings-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.arrow-icon {
  font-size: 1rem;
  animation: bounce 3s infinite;
  display: inline-block;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.settings-link:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.settings-link:hover .arrow-icon {
  animation-duration: 0.5s;
}

/* Show on mobile devices */
@media (max-width: 768px) {
  .quick-links {
    display: block;
  }
}
</style>