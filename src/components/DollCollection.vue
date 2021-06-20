<template>
<div id="canvasContainer" :style="divStyle"
     :class="{ thumbnail: thumbnail || outOfView }">
  <canvas :width="modWidth" :height="modHeight"
          :class="{ notChosen: !mod }"
          id="modResultCanvas" />
  <canvas :width="width" :height="height"
          :class="{ notChosen: mod }"
          id="resultCanvas" />
</div>
</template>

<script>
import { initGunPosition2, drawGunBlank, drawGun, drawText } from '../lib/canvas.js'

const dollCanvasConfig = {
  width: 850,
  height: 510,
  radius: 13,
  textConfig: {
    name: { x: 30, y: 18, prefix: '', show: true },
    uid: { x: 700, y: 18, prefix: 'UID: ', show: true },
    level: { x: 850 / 2, y: 18, prefix: 'Lv. ', show: true },
    server: { x: 30, y: 510 - 30,  prefix: '', show: true },
  },
  avatar: { show: false },
}
const modCanvasConfig = {
  width: 850,
  height: 220,
  radius: 20,
  textConfig: {
    name: { x: 20, y: 15, prefix: '', show: true },
    uid: { x: 20, y: 36, prefix: 'UID: ', show: true },
    level: { x: 20, y: 57, prefix: 'Lv. ', show: true },
    server: { x: 20, y: 78, prefix: '', show: true },
  },
  avatar: { x: 20, y: 99, size: 100, show: true },
}

var imageCache = {}

export default {
  name: 'DollCollection',
  props: {
    ui: Object,
    dolls: Object,
    modDolls: Object,
    thumbnail: Boolean,
    mod: Boolean,
    radius: {
      type: Number,
      default: 13
    },
    modRadius: {
      type: Number,
      default: 20
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
      width: dollCanvasConfig.width,
      height: dollCanvasConfig.height,
      modWidth: modCanvasConfig.width,
      modHeight: modCanvasConfig.height,
      positions: {},
      modPositions: {},
      observer: null,
    }
  },
  computed: {
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
    this.modPositions = initGunPosition2(
      200, 10, this.modRadius, this.modDolls,
      {
        AR: 12,
        SMG: 12,
        RF: 12,
        HG: 12,
        SG: 12,
        MG: 12
      }, 0)
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
    collectionStats (collection) {
      var stats = {}
      for(var type in collection) {
        stats[type] = Object.values(collection[type]).reduce(
          (sum, current) => sum + current
        )
      }
      return stats
    },
    // reconstructed from https://github.com/fc4soda/gfBadge
    // redraw: load background and adjutant images
    //         and pass them to drawBoth
    redraw () {
      var background = new Image()
      var adjutant = new Image()
      let remainingImages = 0
      if(this.background.url != '') {
        remainingImages += 1
      }
      if(this.adjutant.url != '') {
        remainingImages += 1
      }
      if(remainingImages === 0) {
        this.drawBoth(
          [background, this.background],
          [adjutant, this.adjutant]
        )
      } else {
        var loaded = () => {
          remainingImages -= 1
          if(remainingImages === 0) {
            this.drawBoth(
              [background, this.background],
              [adjutant, this.adjutant]
            )
          }
        }
        background.onload = loaded
        adjutant.onload = loaded
        background.src = this.background.url
        adjutant.src = this.adjutant.url
      }
    },
    // drawBoth: pass the arguments to draw, where most logic lies
    drawBoth (background, adjutant) {
      var modCanvas = document.getElementById('modResultCanvas')
      var modContext = modCanvas.getContext('2d')
      this.draw(modContext, modCanvasConfig,
                this.modPositions, this.ui.modCollection,
                background, adjutant)
      
      var canvas = document.getElementById('resultCanvas')
      var context = canvas.getContext('2d')
      this.draw(context, dollCanvasConfig,
                this.positions, this.ui.collection,
                background, adjutant)
    },
    // draw: dispatch config to corresponding drawing functions
    draw (context, config,
          positions, collection, background, adjutant) {
      context.clearRect(0, 0, config.width, config.height)
      this.drawImages(context, background, adjutant)
      this.drawDolls(context, positions, collection, config.radius)
      context.globalAlpha = 1
      this.drawDollTexts(context, positions, collection)
      this.drawInfoTexts(context, config.textConfig, config.avatar)
    },
    drawImages (context, background, adjutant) {
      console.log(background)
      var [ backgroundImage, backgroundConfig ] = background
      var [ adjutantImage, adjutantConfig ] = adjutant
      context.globalAlpha = backgroundConfig.opacity
      context.drawImage(backgroundImage,
                        backgroundConfig.x,
                        backgroundConfig.y,
                        backgroundImage.width * backgroundConfig.scale,
                        backgroundImage.height * backgroundConfig.scale
                       )
      context.globalAlpha = adjutantConfig.opacity
      context.drawImage(adjutantImage,
                        adjutantConfig.x,
                        adjutantConfig.y,
                        adjutantImage.width * adjutantConfig.scale,
                        adjutantImage.height * adjutantConfig.scale
                       )
    },
    drawDolls (context, positions, collection, radius) {
      var allCollection = Object.fromEntries(
        [].concat(...
                  Object.values(collection)
                  .map(proxy => Object.entries(proxy))))
      for(var id in positions.guns) {
        var doll = positions.guns[id]
        context.globalAlpha = this.background.opacity
        drawGunBlank(context, positions.guns[id], radius, 1)
        if(allCollection[id]) {
          context.globalAlpha = 1
          if(doll.img in imageCache) {
            drawGun(context, imageCache[doll.img], doll, radius, 2)()
          } else {
            let img = new Image()
            img.onload = drawGun(context, img, doll, radius, 2)
            img.src = doll.img
            imageCache[doll.img] = img
          }
        }
      }
    },
    drawDollTexts (context, positions, collection) {
      for(var type in positions.text) {
        var texts = positions.text[type]
        if(texts.num) {
          var collectionStats = this.collectionStats(collection)
          drawText(context, (collectionStats[type] ? collectionStats[type] : 0)
                   + '/' + texts.num.text,
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
    drawInfoTexts (context, textConfig, avatarConfig) {
      for(var key in this.ui.info) {
        if(key in textConfig) {
          var config = textConfig[key]
          drawText(context, config.prefix + this.ui.info[key],
                   config.x, config.y, '1.1rem Arial',
                   'white', 2, 'black', 'left', 'middle')
        }
      }
      if(avatarConfig.show) {
        var avatar = new Image()
        avatar.onload = () => {
          context.drawImage(avatar,
                            avatarConfig.x,
                            avatarConfig.y,
                            avatarConfig.size,
                            avatarConfig.size
                           )
        }
        avatar.src = this.ui.info.avatar
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
  margin-top: auto;
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

.thumbnail canvas.notChosen {
  display: none;
}

.notChosen {
  display: none;
}
</style>
