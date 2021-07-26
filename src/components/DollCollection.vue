-<template>
<div>
  <div ref="canvasContainer" id="canvasContainer" :style="divStyle"
       :class="{ thumbnail: thumbnail || outOfView }">
    <canvas ref="modCanvas"
            :class="{ notChosen: !mod }"
            id="modResultCanvas" />
    <canvas ref="canvas"
            :class="{ notChosen: mod }"
            id="resultCanvas" />
  </div>
  <w-notification
    v-model="notification.show"
    timeout="2000"
    :success="notification.success"
    :error="!notification.success"
    plain round shadow transition="bounce">
    {{ notification.message }}
</w-notification>
</div>
</template>

<script>
import { initGunPosition2, drawGunBlank, drawGun, drawText, drawBox } from '../lib/canvas.js'

const dollCanvasConfig = {
  width: 850,
  height: 510,
  radius: 13,
  lineWidth: 2,
  textConfig: {
    name: { x: 30, y: 18, prefix: '', show: true,
            font: { size: 1.1, unit: 'rem', name: 'Arial', },
          },
    uid: { x: 700, y: 18, prefix: 'UID: ', show: true,
           font: { size: 1.1, unit: 'rem', name: 'Arial', },
         },
    level: { x: 477, y: 18, prefix: 'Lv. ', show: true,
             font: { size: 1.1, unit: 'rem', name: 'Arial', },
           },
    server: { x: 253, y: 18,  prefix: '', show: true,
              font: { size: 1.1, unit: 'rem', name: 'Arial', },
            },
  },
  offsets: {
    background: { x: 0, y: 0 },
    adjutant: { x: 0, y: 0 },
  },
  avatar: { show: false },
  collectionRate: {
    x: 850 - 300 - 10, y: 510 - 20, w: 300, h: 9,
    category: {
      nameFont: { size: 0.8, unit: 'rem', name: 'Arial', },
      statsFont: { size: 0.8, unit: 'rem', name: 'Arial', },
    },
    text: { x: 845, y: 510 - 20,
            font: { size: 1.2, unit: 'rem', name: 'Arial', },
          },
  },
}
const modCanvasConfig = {
  width: 850,
  height: 220,
  radius: 20,
  lineWidth: 3,
  textConfig: {
    name: { x: 20, y: 15, prefix: '', show: true,
            font: { size: 1.1, unit: 'rem', name: 'Arial', },
          },
    uid: { x: 20, y: 36, prefix: 'UID: ', show: true,
           font: { size: 1.1, unit: 'rem', name: 'Arial', },
         },
    level: { x: 20, y: 57, prefix: 'Lv. ', show: true,
             font: { size: 1.1, unit: 'rem', name: 'Arial', },
           },
    server: { x: 20, y: 78, prefix: '', show: true,
              font: { size: 1.1, unit: 'rem', name: 'Arial', },
            },
  },
  offsets: {
    background: { x: 0, y: -(510 - 220)/2 },
    adjutant: { x: 0, y: -220 / 2 },
  },
  avatar: { x: 20, y: 99, size: 100, show: true, },
  collectionRate: {
    x: 850 - 300 - 10, y: 190, w: 300, h: 9,
    category: {
      nameFont: { size: 0.8, unit: 'rem', name: 'Arial', },
      statsFont: { size: 0.8, unit: 'rem', name: 'Arial', },
    },
    text: { x: 845, y: 190,
            font: { size: 1.2, unit: 'rem', name: 'Arial', },
          },
  },
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
    background: {
      type: Object
    },
    adjutant: {
      type: Object
    }
  },
  data () {
    return {
      timestamp: 0,
      lastScale: 0,
      updating: false,
      outOfView: false,
      width: dollCanvasConfig.width,
      height: dollCanvasConfig.height,
      modWidth: modCanvasConfig.width,
      modHeight: modCanvasConfig.height,
      positions: {},
      modPositions: {},
      observer: null,
      notification: {
        show: false,
        message: '',
        success: true,
      },
    }
  },
  computed: {
    divStyle () {
      return 'height: ' + this.height + 'px'
    },
    radius () {
      return dollCanvasConfig.radius * this.getScale()
    },
    modRadius () {
      return modCanvasConfig.radius * this.getScale()
    },
  },
  created () {
    this.initPositions()
  },
  mounted () {
    this.redraw()
    var container = this.$refs.canvasContainer
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
    initPositions () {
      this.positions = initGunPosition2(
        80 * this.getScale(), 30 * this.getScale(), this.radius, this.dolls,
        {
          AR: 30,
          SMG: 27,
          HG: 23,
          RF: 23,
          MG: 20,
          SG: 20,
          SF: 20
        },
        this.radius)
      this.modPositions = initGunPosition2(
        200 * this.getScale(), 10 * this.getScale(), this.modRadius, this.modDolls,
        {
          AR: 12,
          SMG: 12,
          RF: 12,
          HG: 12,
          SG: 12,
          MG: 12,
          // Coalition: 20 // none will be modded
      }, 0)
    },
    getScale () {
      return this.ui.info.highResolution + 1
    },
    scaleConfig (config, scale) {
      var scaledConfig = {}
      const keywords = ['x', 'y', 'width', 'height', 'w', 'h', 'radius', 'scale', 'size', 'lineWidth']
      for(var i in config) {
        if(typeof config[i] === 'object') {
          scaledConfig[i] = this.scaleConfig(config[i], scale)
        } else {
          if(keywords.includes(i)
             && typeof config[i] === 'number') {
            scaledConfig[i] = config[i] * scale
          } else {
            scaledConfig[i] = config[i]
          }
        }
      }
      return scaledConfig
    },
    collectionStats (collection) {
      var stats = {}
      for(var type in collection) {
        var collected = collection[type]
        if(!this.ui.info.statsForEX) {
          collected = Object.fromEntries(
            Object.entries(collected)
              .filter(entry => !this.isExtra(entry[0])))
        }
        if(Object.keys(collected).length !== 0) {
          stats[type] = {
            collected: Object.values(collected).reduce(
              (sum, current) => sum + current),
            total: Object.keys(collected).length,
          }
        }
      }
      return stats
    },
    isExtra (id) {
      if(typeof id === 'number') {
        return 1000 <= id && id < 2000
      } else {
        id = Number.parseInt(id)
        return 1000 <= id && id < 2000
      }
    },
    isSF (id) {
      return id?.startsWith('c')
    },
    getFont (font, defaultString) {
      if(font) {
        return '' + font.size + font.unit + ' ' + font.name
      } else {
        if(defaultString) {
          return defaultString
        } else {
          return 'Arial'
        }
      }
    },
    getCanvas () {
      if(this.mod) {
        return this.$refs.modCanvas
      } else {
        return this.$refs.canvas
      }
    },
    updateResolution () {
      var canvas = this.$refs.canvas
      var modCanvas = this.$refs.modCanvas
      canvas.width = this.width
      canvas.height = this.height
      modCanvas.width = this.modWidth
      modCanvas.height = this.modHeight
    },
    updateScale () {
      // setting resolution empties the canvas
      // thus we are manually handling it instead of leaving it to vue
      if(this.lastScale !== this.getScale()) {
        var scale = this.getScale()
        this.width = dollCanvasConfig.width * scale
        this.height = dollCanvasConfig.height * scale
        this.modWidth = modCanvasConfig.width * scale
        this.modHeight = modCanvasConfig.height * scale
        this.lastScale = scale
        this.updateResolution()
        this.initPositions()
      }
    },
    // reconstructed from https://github.com/fc4soda/gfBadge
    // redraw: load background and adjutant images
    //         and pass them to drawBoth
    redraw () {
      let now = Date.now()
      this.timestamp = now
      this.updateScale()
      let background = new Image()
      // background.crossOrigin = 'Anonymous'
      let adjutant = new Image()
      // adjutant.crossOrigin = 'Anonymous'
      let remainingImages = 0
      if(this.background.url !== '') {
        remainingImages += 1
      }
      if(this.adjutant.url !== '') {
        remainingImages += 1
      }
      if(remainingImages === 0) {
        this.drawBoth(
          [background,
           this.scaleConfig(this.background, this.getScale()),
           now],
          [adjutant,
           this.scaleConfig(this.adjutant, this.getScale()),
           now],
          now
        )
      } else {
        const loaded = () => {
          remainingImages -= 1
          if(remainingImages === 0) {
            this.drawBoth(
              [background,
               this.scaleConfig(this.background, this.getScale()),
               now],
              [adjutant,
               this.scaleConfig(this.adjutant, this.getScale()),
               now],
              now
            )
          }
        }
        const failed = (e) => {
          console.log(e.target.src)
          if(e.target.src.indexOf('/') != -1) {
            this.notification.success = false
            this.notification.message =
              this.$t('message.loadFailed') + ' ' + e.target.alt + ': ' + e.target.src
            this.notification.show = true
            setTimeout(() => loaded(), 10)
          }
          return true
        }
        if(this.background.url !== '') {
          background.onerror = failed
          background.onload = loaded
          background.alt = this.$t('tabAdjust.background')
          background.src = this.background.url
        }
        if(this.adjutant.url !== '') {
          adjutant.onerror = failed
          adjutant.onload = loaded
          adjutant.alt = this.$t('tabAdjust.adjutantOffset')
          adjutant.src = this.adjutant.url
        }
      }
    },
    // drawBoth: pass the arguments to draw, where most logic lies
    drawBoth (background, adjutant, now) {
      var modCanvas = this.$refs.modCanvas
      var modContext = modCanvas.getContext('2d')
      var modConfig = this.scaleConfig(modCanvasConfig, this.getScale())
      modConfig.now = now
      modContext.clearRect(0, 0, this.modWidth, this.modHeight)
      this.draw(modContext,
                modConfig,
                this.modPositions, this.ui.modCollection,
                background, adjutant, this.ui.hexagons)
      
      var canvas = this.$refs.canvas
      var context = canvas.getContext('2d')
      context.clearRect(0, 0, this.width, this.height)
      var config = this.scaleConfig(dollCanvasConfig, this.getScale())
      config.now = now
      this.draw(context,
                config,
                this.positions, this.ui.collection,
                background, adjutant, this.ui.hexagons)
    },
    // draw: dispatch config to corresponding drawing functions
    draw (context, config,
          positions, collection,
          background, adjutant, hexagonConfig) {
      this.drawImages(context, background, adjutant, config.offsets)
      this.drawDolls(context, positions, collection,
                     config.radius, config.lineWidth,
                     hexagonConfig, config.now)
      context.globalAlpha = 1
      this.drawDollTexts(context, positions, collection, config.collectionRate)
      this.drawInfoTexts(context, config.textConfig, config.avatar)
    },
    drawImages (context, background, adjutant, offsets) {
      var [ backgroundImage, backgroundConfig, now ] = background
      var [ adjutantImage, adjutantConfig ] = adjutant
      context.globalAlpha = backgroundConfig.opacity
      if(backgroundImage.width != 0 && now === this.timestamp) {
        context.drawImage(backgroundImage,
                          backgroundConfig.x + offsets.background.x,
                          backgroundConfig.y + offsets.background.y,
                          backgroundImage.width * backgroundConfig.scale,
                          backgroundImage.height * backgroundConfig.scale
                         )
      }
      context.globalAlpha = adjutantConfig.opacity
      if(adjutantImage.width != 0 && now === this.timestamp) {
        context.drawImage(adjutantImage,
                          adjutantConfig.x + offsets.adjutant.x,
                          adjutantConfig.y + offsets.adjutant.y,
                          adjutantImage.width * adjutantConfig.scale,
                          adjutantImage.height * adjutantConfig.scale
                         )
      }
    },
    // the main hexagon part
    drawDolls (context, positions, collection,
               radius, lineWidth, hexagonConfig, now) {
      var allCollection = Object.fromEntries(
        [].concat(...
                  Object.values(collection)
                  .map(proxy => Object.entries(proxy))))
      for(var id in positions.guns) {
        var doll = positions.guns[id]
        context.globalAlpha = hexagonConfig.opacity
        drawGunBlank(context, positions.guns[id], radius, 1)
        if(allCollection[id]) {
          context.globalAlpha = 1
          if(doll.img in imageCache) {
            let img = imageCache[doll.img]
            let drawFunc = drawGun(context, img, doll, radius, lineWidth)
            if(img.complete) {
              drawFunc()
            } else {
              img.onload = () => {
                if(now === this.timestamp) {
                  drawFunc()
                }
              }
            }
          } else {
            let img = new Image()
            // img.crossOrigin = 'Anonymous'
            let drawFunc = drawGun(context, img, doll, radius, lineWidth)
            img.onload = () => {
              if(now === this.timestamp) {
                drawFunc()
              }
            }
            img.src = doll.img
            imageCache[doll.img] = img
          }
        }
      }
    },
    drawDollTexts (context, positions, collection, boxConfig) {
      var collectionStats = this.collectionStats(collection)
      for(var type in positions.text) {
        var texts = positions.text[type]
        if(texts.num) {
          drawText(context, (collectionStats[type] ? collectionStats[type]['collected'] : 0)
                   + '/' + (collectionStats[type] ? collectionStats[type]['total'] : texts.num.text),
                   texts.num.x + this.radius, texts.num.y,
                   this.getFont(boxConfig.category.statsFont),
                   'white', 2, 'black', 'left', 'middle')
        }
        if(texts.name) {
          drawText(context, texts.name.text,
                   texts.name.x - this.radius, texts.name.y,
                   this.getFont(boxConfig.category.nameFont),
                   'white', 2, 'black', 'right', 'middle')
        }
      }
      this.drawCollectionRate(context, collectionStats, boxConfig)
    },
    drawCollectionRate (context, collectionStats, boxConfig) {
      var total = 0
      var collected = 0
      for(var type in collectionStats) {
        if(type === 'SF') {
          if(this.ui.info.statsForSF) {
            total += collectionStats[type]['total']
            collected += collectionStats[type]['collected']
          }
        } else {
          total += collectionStats[type]['total']
          collected += collectionStats[type]['collected']
        }
      }
      drawBox(context, boxConfig.x, boxConfig.y, boxConfig.w, boxConfig.h, 1, collected / total)
      var textConfig = boxConfig.text
      var text = `${collected}/${total}`
      if(total === 0) {
        text += ' (0%)'
      } else {
        text += ` (${parseFloat(collected/total*100).toFixed(0) + '%'})`
      }
      drawText(context,
               text,
               textConfig.x, textConfig.y,
               this.getFont(textConfig.font),
               'white', 2, 'black', 'right', 'middle')
    },
    drawInfoTexts (context, textConfig, avatarConfig) {
      for(var key in this.ui.info) {
        if(key in textConfig) {
          var config = textConfig[key]
          drawText(context, config.prefix + this.ui.info[key],
                   config.x, config.y,
                   this.getFont(config.font),
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
div#canvasContainer {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
}

canvas {
  border: 1px dashed gold;
  margin-top: auto;
  max-width: 100%;
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
