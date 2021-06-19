<template>
<div>
  <canvas :width="width" :height="height" id="resultCanvas" />
</div>
</template>

<script>
const backgroundUrls = [
  'File:BG-Kitchen.png',
  'File:BG-Grass.png',
  'File:BG-GrassWedding.png',
  'File:BG-Dorm.png',
  'File:BG-Beach.png',
  'File:BG-BeachNight.png',
  'File:BG-Bar.png',
  'File:BG-BarHallow.png',
  'File:BG-BarSpring.png',
  'File:BG-BarXmas.png',
  'File:BG Street.png',
  'File:BG Inner.png',
  'File:BG City.png',
  'File:BG Base.png',
  'File:冰湖.png',
  'File:大桥.png',
  'File:机场.png',
  'File:街道.png',
  'File:树林.png',
  'File:雪地.png',
  'File:主界面背景.png'
]

import { initGunPosition2, drawGunBlank, drawGun, drawText } from '../lib/canvas.js'

const defaultBackground = {
  url: '',
  x: 50,
  y: 230,
  scale: 1,
  opacity: 0.7,
}

export default {
  name: 'DollCollection',
  props: {
    ui: Object,
    dolls: Object,
    radius: {
      type: Number,
      default: 13
    },
    background: {
      type: Object,
      default: () => { return defaultBackground }
    },
    adjutant: {
      type: [Object, null],
      default: null,
    }
  },
  data () {
    return {
      updating: false,
      width: 850,
      height: 510,
      positions: {}
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
      if(this.adjutant) {
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
        if(this.adjutant) {
          adjutant.src = this.adjutant.url
        }
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
                        canvas.width,
                        canvas.height,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                       )
      // TODO
      console.log(adjutant)
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
          let img = new Image()
          img.onload = drawGun(context, img, doll, this.radius, 2)
          img.src = doll.img
        }
      }
      for(var type in this.positions.text) {
        var texts = this.positions.text[type]
        if(texts.num) {
          drawText(context, this.collectionStats[type] + '/' + texts.num.text,
                   texts.num.x + this.radius, texts.num.y,
                   'Arial', 'white', 2, 'black', 'left', 'middle')
        }
        if(texts.name) {
          drawText(context, texts.name.text,
                   texts.name.x - this.radius, texts.name.y,
                   'Arial', 'white', 2, 'black', 'right', 'middle')
        }
      }
    },
    getBackgrounds () {
      var all = []
      for(var background of backgroundUrls) {
        fetch("http://www.gfwiki.org/api.php?action=query&titles=" + background + "&prop=imageinfo&iiprop=url&format=json")
          .then(response => response.json())
          .then(json => {
            all.push(Object.values(json.query.pages)[0].imageinfo[0].url)
            console.log(all)
          })
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
</style>
