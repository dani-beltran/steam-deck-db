<template>
  <div class="processing-warning">
    <div class="warning-icon">⏳</div>
    <h3>Settings Being Processed</h3>
    <p>The game settings for {{ gameName }} are still being processed.</p>
    <p>Please check back in a few minutes.</p>
    <button @click="handleDismiss" class="warning-dismiss">Dismiss</button>
  </div>
</template>

<script>
export default {
  name: 'ProcessingWarning',
  props: {
    gameName: {
      type: String,
      required: true
    }
  },
  emits: ['dismiss'],
  methods: {
    handleDismiss() {
      this.$emit('dismiss')
    }
  }
}
</script>

<style scoped>
.processing-warning {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  color: #92400e;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.processing-warning h3 {
  color: #92400e;
  margin: 0 0 12px 0;
  font-size: 1.2rem;
}

.processing-warning p {
  margin: 8px 0;
}

.warning-dismiss {
  background: #d97706;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 12px;
}

.warning-dismiss:hover {
  background: #b45309;
}
</style>