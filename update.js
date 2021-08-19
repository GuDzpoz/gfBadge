const fs = require('fs/promises')
const md5 = require('blueimp-md5')
const nodeFetch = require('node-fetch')
var fetch = require('fetch-retry')(nodeFetch)
const { JSDOM } = require("jsdom")

const cookies = ''

const oldFetch = fetch

fetch = (url, opts) => {
  return oldFetch(url, {
    retries: 5,
    retryDelay: 1000,
    retryOn: (attempt, error, response) => {
      if(error !== null || response.status !== 200) {
        console.log('Retrying...')
        return true
      } else {
        if(opts?.type) {
          if(!(new String(response.headers.get('content-type')).includes(opts.type))) {
            console.log('Retrying...')
            return true
          }
        } else {
          if(!(new String(response.headers.get('content-type')).includes('json'))) {
            console.log('Retrying...')
            return true
          }
        }
      }
    },
    headers: {
      cookie: cookies
    }
  })
}

// or else could not use await
async function main() {
  if(process.argv.length > 2) {
    switch(process.argv[2]) {
    case 'coalition':
      await taskCoalition(false)
      break
    case 'npcs':
      await taskNPCs()
      break
    case 'backgrounds':
      await taskBackgrounds()
      break
    case '--help':
    case '-h':
      printHelp()
      break
    default:
      console.log('Unrecognized option: ' + process.argv[2])
      printHelp()
      break
    }
  } else {
    taskDolls(true)
    taskCoalition(true)
    taskNPCs()
    taskBackgrounds()
  }
}

function printHelp() {
  console.log(
    'update.js: Update doll data from GFWiki\n'
      + 'Usage: 1) node update.js [option]\n'
      + '       2) yarn update-data [option]\n'
      + '\n'
      + 'Available option:\n'
      + '  --help, -h       Display this info\n'
      + '  coalition        Fetch coalition doll info\n'
      + '  npcs             Fetch npc illustrations\n'
      + '  backgrounds      Fetch background images'
  )
}

const coalitionCollectionPage = 'http://www.gfwiki.org/api.php?action=parse&prop=text&page=%E8%9E%8D%E5%90%88%E5%8A%BF%E5%8A%9B%E5%9B%BE%E9%89%B4&format=json'
async function getCoalitionDolls(callback) {
  await fetch(coalitionCollectionPage)
    .then(response => {
      console.log("CDOLLs: Status: " + response.status)
      return response.json()
    }).then(async json => {
      var dom = new JSDOM(json.parse.text['*'])
      var coalitionDolls = {}
      for(var div of
          dom.window.document.querySelectorAll('.sfdata[data-star="3"]')) {
        var data = {}
        for(var attr of div.attributes) {
          if(attr.name.startsWith('data')) {
            if(attr.name === 'data-id') {
              data['data-id'] = 'c' + attr.value
            } else {
              data[attr.name] = attr.value
            }
          }
        }
        var doll = {
          type: 'SF',
          rarity: 6,
          modded: false,
          skins: {}
        }
        doll.id = data['data-id']
        doll.cnname = data['data-name-ingame']
        console.log('Fetching the code name of ' + doll.cnname + '...')
        var pageUrl = data['data-url'] // '/w/THE_NAME'
        var url = 'http://gfwiki.org/api.php?action=parse&prop=wikitext&format=json&page=' + pageUrl.substring(3)
        await fetch(url, { retries: 5, retryDelay: 1000 })
          .then(response => response.json())
          .then(async json => {
            var skins = {}
            var wikitext = json.parse.wikitext['*']
                .replace(/<!--(.*?)-->/gm, '')
            var info = parseWikiTag(wikitext)
            for(var key of Object.keys(info).filter(
              key => key.startsWith('立绘2')
            )) {
              var filename = info[key].replaceAll(' ', '_')
              var start = filename.toLowerCase().indexOf('pic_') + 4
              var end = filename.toLowerCase().lastIndexOf('_ll_1.png')
              var code = filename.substring(start, end)
              doll.code = code
              console.log('- Got: ' + code)
            }
          })
        doll.icon = 'Icon_' + doll.code + '_SS_1.png'
        doll.skins[doll.cnname] = 'pic_' + doll.code + '_LL.png'
        doll.skins[doll.cnname + '（五星）'] = 'pic_' + doll.code + '_LL_1.png'
        coalitionDolls[doll.id] = doll
      }
      await callback(coalitionDolls)
    })
}

async function taskCoalition(wantsSkins) {
  const coalitionJsPath = './utils/coalition.json'
  console.log('CDOLLS: Updating coalition doll data from gfwiki...')
  await getCoalitionDolls(async (dolls) => {
    console.log('CDOLLS: Collected ' + dolls.length + ' dolls.')
    console.log('CDOLLS: Saving to "' + coalitionJsPath + '"...')
    await fs.writeFile(coalitionJsPath,
                       JSON.stringify(dolls)
                      )
    console.log('CDOLLS: Saved.')
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseWikiTag(wikiString) {
  var info = {}
  /*
    Original solution without ways to deal with hierarchical structures
    var match = wikitext.match(
    /\{\{融合势力信息2\n*(\|[^\{\}=]+(=[^\{\}\|]*)?)+\}\}/gm)
    var match = wikitext.match(
    /\{\{战术少女信息3\n*(\|[^\{\}=]+(=[^\{\}\|]*)?)+\}\}/gm)
  */
  var start = wikiString.indexOf('{{')
  var end = wikiString.lastIndexOf('}}')
  if(start === -1 || end === -1) {
    return info;
  } else {
    var contents =
        wikiString.substring(start + 2, end).split('|')
    for(var pairString of contents) {
      var separation = pairString.indexOf('=')
      if(separation !== -1) {
        var key = pairString.substring(0, separation)
        var value = pairString.substring(separation + 1)
        info[key.trim()] = value.trim()
      }
    }
    return info
  }
}

const npcCollectionPage = 'http://gfwiki.org/api.php?page=%E7%99%BB%E5%9C%BA%E4%BA%BA%E7%89%A9&action=parse&prop=wikitext&format=json'
async function getNPCs(callback) {
  await fetch(npcCollectionPage)
    .then(response => {
      console.log('NPCs: Status: ' + response.status)
      return response.json()
    })
    .then(async (json) => {
      var wikitext = json.parse.wikitext['*']
      var NPCs = []
      for(var infoMatch of
          wikitext.matchAll(/\{\{人物介绍\n*(\|[^=]+=[^\{\}|]*)+\}\}/gm)) {
        var info = parseWikiTag(infoMatch[0])
        NPCs.push(info)
      }
      await callback(NPCs)
    })
}

const level = 2
function getWikiMediaUrl(filename) {
  return filename.replaceAll(' ', '_').replace('Pic_', 'pic_')
  // capitalize the first letter
  filename = filename.charAt(0).toUpperCase() + filename.substring(1)
  // replace ' ' with '_'
  filename = filename.replaceAll(' ', '_')
  var hash = md5(filename)
  var url = '/'
  for(var i = 0; i < level; ++i) {
    url += hash.substring(0, i+1)
    url += '/'
  }
  url += filename
  return url
}

async function taskNPCs() {
  console.log('NPCs: Updating NPC illustrations from gfwiki...')
  const npcsJsPath = './src/assets/npcs.js'
  await getNPCs(async (NPCs) => {
    console.log('NPCs: Collected ' + NPCs.length + ' NPCs.')
    var NPCData = {}
    for(var NPC of NPCs) {
      var illustrations = {}
      var pictureKeys = Object.keys(NPC).filter(key => key.startsWith('pic'))
      for(var pictureKey of pictureKeys) {
        // extract 1, 2, 3, ... from pic1, pic2, pic3, ...
        var index = pictureKey.substring('pic'.length)
        if(NPC['name' + index]) {
          illustrations[NPC['name' + index]] = getWikiMediaUrl(NPC[pictureKey])
        } else {
          illustrations[NPC['中文名称']] = getWikiMediaUrl(NPC[pictureKey])
        }
      }
      NPCData[NPC['中文名称']] = illustrations
    }
    console.log('NPCs: Collected ' + Object.keys(NPCData).length + 'NPCs in total.')
    console.log('NPCs: Saving to "' + npcsJsPath + '"...')
    await fs.writeFile(npcsJsPath,
                       'export const npcs = ' + JSON.stringify(NPCData)
                      )
    console.log('NPCs: Saved.')
  })
}

const backgroundUrls = {
  '厨房': 'BG-Kitchen.png',
  '草地': 'BG-Grass.png',
  '婚礼草地': 'BG-GrassWedding.png',
  '宿舍': 'BG-Dorm.png',
  '海滩': 'BG-Beach.png',
  '夜晚海滩': 'BG-BeachNight.png',
  '酒吧': 'BG-Bar.png',
  '万圣节酒吧': 'BG-BarHallow.png',
  '春节酒吧': 'BG-BarSpring.png',
  '圣诞节酒吧': 'BG-BarXmas.png',
  '街道涂鸦': 'BG Street.png',
  '临时作战室': 'BG Inner.png',
  '城市': 'BG City.png',
  '基地': 'BG Base.png',
  '冰湖': '冰湖.png',
  '大桥': '大桥.png',
  '机场': '机场.png',
  '街道': '街道.png',
  '树林': '树林.png',
  '雪地': '雪地.png',
  '主界面': '主界面背景.png'
}

async function getBackgrounds(callback) {
  var backgrounds = {}
  for(var i in backgroundUrls) {
    // backgrounds[i] = 'http://www.gfwiki.org/images' + getWikiMediaUrl(backgroundUrls[i])
    backgrounds[i] = getWikiMediaUrl(backgroundUrls[i])
  }
  await callback(backgrounds)
}

async function taskBackgrounds() {
  const bgsJsPath = './src/assets/backgrounds.js'
  console.log('BGs: Computing background image urls...')
  await getBackgrounds(async (backgrounds) => {
    console.log('BGs: Collected ' + Object.keys(backgrounds).length + ' background images.')
    console.log('BGs: Saving to "' + bgsJsPath + '"...')
    backgrounds['_'] = './images/backgrounds'
    await fs.writeFile(bgsJsPath,
                       'export const backgrounds = ' + JSON.stringify(backgrounds)
                      )
    console.log('BGs: Saved.')
  })
}

main()
