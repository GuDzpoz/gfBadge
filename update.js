const fs = require('fs/promises')
const md5 = require('blueimp-md5')
const nodeFetch = require('node-fetch')
const fetch = require('fetch-retry')(nodeFetch)
const { JSDOM } = require("jsdom")

const dollCollectionPage = 'http://www.gfwiki.org/api.php?action=parse&prop=text&page=%E6%88%98%E6%9C%AF%E4%BA%BA%E5%BD%A2%E5%9B%BE%E9%89%B4&format=json'
async function getDolls(callback) {
  fetch(dollCollectionPage)
    .then(response => {
      console.log('DOLLS: Status: ' + response.status)
      return response.json()
    })
    .then(async (json) => {
      var dom = new JSDOM(json.parse.text['*'])
      var dolls = []
      for(var div of
          dom.window.document.getElementsByClassName('dolldata')) {
        var doll = {}
        for(var attr of div.attributes) {
          if(attr.name.startsWith('data')) {
            doll[attr.name] = attr.value
          }
        }
        dolls.push(doll)
      }
      await callback(dolls)
    })
}

function deduplicateDolls(dolls) {
  var ids = []
  return dolls.filter((doll) => {
    var id = doll['data-id']
    if(ids.includes(id)) {
      return false
    } else {
      ids.push(id)
      return true
    }
  })
}

const dollsJsPath = './src/assets/dolls.js'
const skinsJsPath = './src/assets/skins.js'
console.log('DOLLS: Updating doll data from gfwiki...')
getDolls(async (dolls) => {
  console.log('DOLLS: Collected ' + dolls.length + ' dolls.')
  console.log('DOLLS: Checking duplicates...')
  dolls = deduplicateDolls(dolls)
  console.log('DOLLS: Collected ' + dolls.length + ' dolls.')
  console.log('DOLLS: Saving to "' + dollsJsPath + '"...')
  await fs.writeFile(dollsJsPath,
               'export const dolls = ' + JSON.stringify(dolls)
              )
  console.log('DOLLS: Saved.')
  console.log('SKINS: Updating doll skins from gfwiki...')
  await getSkins(dolls, async (skins) => {
    console.log('SKINS: Saving to "' + skinsJsPath + '"...')
    await fs.writeFile(skinsJsPath,
                       'export const skins = ' + JSON.stringify(skins)
                      )
    console.log('SKINS: Saved.')
  })
})

function getDollDefaultSkinFilename(code) {
  return [
    'Pic_' + code + '.png',
    'Pic_' + code + '_D.png'
  ]
}

function getDollModSkinFilename(code) {
  return [
    'Pic_' + code + 'Mod.png',
    'Pic_' + code + 'Mod_D.png'
  ]
}

function getDollSkinFilename(code, skinId) {
  return [
    'Pic_' + code + '_' + skinId +'.png',
    'Pic_' + code + '_' + skinId +'_D.png'
  ]
}

function addBothSkins(skins, name, filenames) {
  skins[name] = getWikiMediaUrl(filenames[0])
  skins[name + '（破）'] = getWikiMediaUrl(filenames[1])
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getSkins(dolls, callback) {
  var dollSkins = {}
  var count = 0
  var promises = []
  for(var doll of dolls) {
    var pageUrl = doll['data-url'] // '/w/THE_NAME'
    var url = 'http://gfwiki.org/api.php?action=parse&prop=wikitext&format=json&page=' + pageUrl.substring(3)
    var promise =  (fetch(url, { retries: 3, retryDelay: 1000 })
      .then(response => response.json())
      .then(json => {
        var skins = {}
        var wikitext = json.parse.wikitext['*']
        var match = wikitext.match(
          /\{\{战术少女信息3\n*(\|[^\{\}=]+(=[^\{\}\|]*)?)+\}\}/gm)
        var info = parseWikiTag(match[0])
        addBothSkins(skins, doll['data-name-ingame'],
                     getDollDefaultSkinFilename(info.code))
        if(doll['data-mod'] === '1') {
          addBothSkins(skins, doll['data-name-ingame'] + 'MOD3',
                       getDollModSkinFilename(info.code))
        }

        for(var key of Object.keys(info).filter(
          key => key.startsWith('装扮') && key.endsWith('名称')
        )) {
          var name = info[key]
          var id = info['装扮' + key.substring(2, key.length - 2) + '编号']
          addBothSkins(skins, name,
                       getDollSkinFilename(info.code, id))
        }
        dollSkins[doll['data-id']] = skins
        count += 1
        console.log(skins)
        console.log('SKINS: '
                    + count + '/' + dolls.length
                    + ' Collected '
                    + Object.keys(skins).length + ' skins of '
                    + doll['data-name-ingame'] + '.')
      }))
    await promise
    promises.push(promise)
  }
  Promise.all(promises).then(async () => {
    await callback(dollSkins)
  })
}

function parseWikiTag(wikiString) {
  var info = {}
  var contents =
      wikiString.substring(2, wikiString.length - 2).split('|')
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

const npcCollectionPage = 'http://gfwiki.org/api.php?page=%E7%99%BB%E5%9C%BA%E4%BA%BA%E7%89%A9&action=parse&prop=wikitext&format=json'
async function getNPCs(callback) {
  fetch(npcCollectionPage)
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
  var hash = md5(filename)
  var url = '/'
  for(var i = 0; i < level; ++i) {
    url += hash.substring(0, i+1)
    url += '/'
  }
  url += filename
  return url
}

console.log('NPCs: Updating NPC illustrations from gfwiki...')
const npcsJsPath = './src/assets/npcs.js'
getNPCs(async (NPCs) => {
  console.log('NPCs: Collected ' + NPCs.length + ' NPCs.')
  var illustrations = []
  for(var NPC of NPCs) {
    var pictureKeys = Object.keys(NPC).filter(key => key.startsWith('pic'))
    for(var pictureKey of pictureKeys) {
      // extract 1, 2, 3, ... from pic1, pic2, pic3, ...
      var index = pictureKey.substring('pic'.length)
      if(NPC['name' + index]) {
        illustrations.push({
          name: NPC['name' + index],
          npc: NPC['中文名称'],
          url: getWikiMediaUrl(NPC[pictureKey])
        })
      } else {
        illustrations.push({
          name: NPC['中文名称'],
          npc: NPC['中文名称'],
          url: getWikiMediaUrl(NPC[pictureKey])
        })
      }
    }
  }
  console.log('NPCs: Collected ' + illustrations.length + ' illustrations in total.')
  console.log('NPCs: Saving to "' + npcsJsPath + '"...')
  await fs.writeFile(npcsJsPath,
                     'export const npcs = ' + JSON.stringify(illustrations)
                    )
  console.log('NPCs: Saved.')
})

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
    backgrounds[i] = 'http://www.gfwiki.org/images' + getWikiMediaUrl(backgroundUrls[i])
  }
  callback(backgrounds)
}

const bgsJsPath = './src/assets/backgrounds.js'
console.log('BGs: Computing background image urls...')
getBackgrounds(async (backgrounds) => {
  console.log('BGs: Collected ' + Object.keys(backgrounds).length + ' background images.')
  console.log('BGs: Saving to "' + bgsJsPath + '"...')
  await fs.writeFile(bgsJsPath,
                     'export const backgrounds = ' + JSON.stringify(backgrounds)
                    )
  console.log('BGs: Saved.')
})
