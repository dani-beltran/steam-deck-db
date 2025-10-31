<template>
  <div class="random-art">
    <img :src="artImageUrl" :alt="caption" class="art-image" />
  <div class="caption" v-html="caption"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const artList = [
  {
    file: 'decku_jobs.jpg',
    caption: '<i>“Stay hungry. Stay foolish.”</i><br/><b>Steve Jobs</b>'
  },
  {
    file: 'el_bufon_stanczyk.png',
    caption: '<i>“Become who you are.”</i><br/><b>Friedrich Nietzsche</b>'
  },
  {
    file: 'el_grito.png',
    caption: '<i>“One who looks outside, dreams; one who looks inside, awakes.”<br/><b>Carl Jung</b></i>'
  },
  {
    file: 'gabe.png',
    caption: '<i>“In Decku we trust.”</i><br/><b>Lord Gaben</b>'
  },
  {
    file: 'houses.png',
    caption: '<i>“In the end, we only regret the chances we didn\'t take.”</i><br/><b>Lewis Carroll</b>'
  }
]

const randomIndex = Math.floor(Math.random() * artList.length)
const selectedArt = artList[randomIndex]

const artImageUrl = computed(() => `/public/art/${selectedArt.file}`)
const caption = selectedArt.caption
</script>

<style scoped>
.random-art {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5rem 0;
}
.art-image {
  max-width: 100%;
  max-height: 640px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}
.caption {
  max-width: 600px;
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #444;
  text-align: center;
  line-height: 1.8;
}

@media screen and (max-width: 768px) {
  .art-image {
    max-height: 320px;
  }

  .caption {
    max-width: 300px;
    font-size: 0.9rem;
    line-height: 1.4;
  } 
}
</style>
