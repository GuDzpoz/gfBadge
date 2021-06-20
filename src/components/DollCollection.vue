<template>
<div id="canvasContainer" :style="divStyle" :class="{ thumbnail: thumbnail || outOfView }">
  <canvas :width="width" :height="height" id="resultCanvas" />
</div>
</template>

<script>
import { initGunPosition2, drawGunBlank, drawGun, drawText } from '../lib/canvas.js'

const defaultBackground = {
  url: '',
  x: 50,
  y: 230,
  scale: 1,
  opacity: 0.7,
}

const defaultAdjutant = {
  url: '',
  x: 300,
  y: 100,
  scale: 0.45,
  opacity: 0.9,
}

var imageCache = {}

export default {
  name: 'DollCollection',
  props: {
    ui: Object,
    dolls: Object,
    thumbnail: Boolean,
    radius: {
      type: Number,
      default: 13
    },
    background: {
      type: Object
    },
    adjutant: {
      type: Object
    }
  },
  data () {
    return {
      updating: false,
      outOfView: false,
      width: 850,
      height: 510,
      positions: {},
      observer: null,
    }
  },
  computed: {
    collectionStats () {
      var stats = {}
      for(var type in this.ui.collection) {
        stats[type] = Object.values(this.ui.collection[type]).reduce(
          (sum, current) => sum + current
        )
      }
      return stats
    },
    mergedBackground () {
      return { ...defaultBackground, ...this.background }
    },
    mergedAdjutant () {
      return { ...defaultAdjutant, ...this.adjutant }
    },
    divStyle () {
      return 'height: ' + this.height + 'px'
    }
  },
  created () {
    this.positions = initGunPosition2(
      80, 30, this.radius, this.dolls,
      {
        AR: 30,
        SMG: 27,
        HG: 23,
        RF: 23,
        MG: 20,
        SG: 20
      },
      this.radius)
  },
  mounted () {
    this.redraw()
    var container = document.getElementById('canvasContainer')
    const observeOptions = {
      rootMargin: '0px',
      threshold: 0,
    }
    if(this.observer === null) {
      this.observer =
        new IntersectionObserver(this.showThumbnail, observeOptions)
    }
    this.observer.unobserve(container)
    this.observer.observe(container)
  },
  watch: {
    ui: {
      handler () {
        this.redraw()
      },
      deep: true
    },
    background () {
      this.redraw()
    }
  },
  methods: {
    // reconstructed from https://github.com/fc4soda/gfBadge
    redraw () {
      var background = new Image()
      var adjutant = new Image()
      let remainingImages = 0
      if(this.mergedBackground.url != '') {
        remainingImages += 1
      }
      if(this.mergedAdjutant.url != '') {
        remainingImages += 1
      }
      if(remainingImages === 0) {
        this.drawImage(background, adjutant)
      } else {
        var loaded = () => {
          remainingImages -= 1
          if(remainingImages === 0) {
            this.drawImage(background, adjutant)
          }
        }
        background.onload = loaded
        adjutant.onload = loaded
        background.src = this.mergedBackground.url
        adjutant.src = this.mergedAdjutant.url
      }
    },
    drawImage (background, adjutant) {
      var canvas = document.getElementById('resultCanvas')
      var context = canvas.getContext('2d')
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.globalAlpha = this.mergedBackground.opacity
      context.drawImage(background,
                        this.mergedBackground.x,
                        this.mergedBackground.y,
                        canvas.width * this.mergedBackground.scale,
                        canvas.height * this.mergedBackground.scale,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                       )
      context.globalAlpha = this.mergedAdjutant.opacity
      context.drawImage(adjutant,
                        this.mergedAdjutant.x,
                        this.mergedAdjutant.y,
                        adjutant.width * this.mergedAdjutant.scale,
                        adjutant.height * this.mergedAdjutant.scale
                       )
      this.drawDolls(context)
      context.globalAlpha = 1
      this.drawDollTexts(context)
      this.drawInfoTexts(context)
    },
    drawDolls (context) {
      var allCollection = Object.fromEntries(
        [].concat(...
                  Object.values(this.ui.collection)
                  .map(proxy => Object.entries(proxy))))
      for(var id in this.positions.guns) {
        var doll = this.positions.guns[id]
        context.globalAlpha = this.mergedBackground.opacity
        drawGunBlank(context, this.positions.guns[id], this.radius, 1)
        if(allCollection[id]) {
          context.globalAlpha = 1
          if(doll.img in imageCache) {
            drawGun(context, imageCache[doll.img], doll, this.radius, 2)()
          } else {
            let img = new Image()
            img.onload = drawGun(context, img, doll, this.radius, 2)
            img.src = doll.img
            imageCache[doll.img] = img
          }
        }
      }
    },
    drawDollTexts (context) {
      for(var type in this.positions.text) {
        var texts = this.positions.text[type]
        if(texts.num) {
          drawText(context, this.collectionStats[type] + '/' + texts.num.text,
                   texts.num.x + this.radius, texts.num.y,
                   '0.8rem Arial', 'white', 2, 'black', 'left', 'middle')
        }
        if(texts.name) {
          drawText(context, texts.name.text,
                   texts.name.x - this.radius, texts.name.y,
                   '0.8rem Arial', 'white', 2, 'black', 'right', 'middle')
        }
      }
    },
    drawInfoTexts (context) {
      const textConfig = {
        name: {
          x: 30,
          y: 18,
          prefix: '',
        },
        uid: {
          x: 700,
          y: 18,
          prefix: 'UID: ',
        },
        level: {
          x: 850 / 2,
          y: 18,
          prefix: 'Lv. ',
        },
        server: {
          x: 30,
          y: 510 - 30,
          prefix: '',
        },
      }
      for(var key in this.ui.info) {
        if(key in textConfig) {
          var config = textConfig[key]
          drawText(context, config.prefix + this.ui.info[key],
                   config.x, config.y, '1.1rem Arial',
                   'white', 2, 'black', 'left', 'middle')
        }
      }
    },
    showThumbnail (entries) {
      if(entries.length === 1) {
        if(entries[0].isIntersecting) {
          this.outOfView = false
        } else {
          this.outOfView = true
        }
      }
    }
  }
}
</script>

<style scoped>
div {
  align-items: center;
  display: flex;
  flex-direction: column;
}

canvas {
  border: 1px dashed gold;
}

#canvasContainer {
  margin: 0;
  padding: 0;
}

.thumbnail canvas {
  position: fixed;
  z-index: 99;
  right: 0;
  top: 0;
  background-color: #ffffff88;
  width: 19rem;
}
</style>
