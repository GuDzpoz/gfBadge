const fs = require('fs/promises')
const md5 = require('blueimp-md5')
const nodeFetch = require('node-fetch')
var fetch = require('fetch-retry')(nodeFetch)
const { JSDOM } = require("jsdom")

const cookies = '_ga=GA1.2.1218003236.1615457660;gfwiki_mw__session=i4jnelt9rr9lkaiu934tcn97fd7ibofu;gfwiki_mw_UserID=5228;gfwiki_mw_UserName=Kanakana;gfwiki_mw_Token=c35b3528e7f6dbade64aad3c9324bd85;wikiEditor-0-toolbar-section=help;wikiEditor-0-booklet-help-page=reference;gfwiki_mw__session=i64uf78252d8ddi7r1akmlnjcfdnld42;gfwiki_mw_UserID=5228;gfwiki_mw_UserName=Kanakana;gfwiki_mw_Token=c35b3528e7f6dbade64aad3c9324bd85'

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
    case 'dolls':
      await taskDolls(false)
      break
    case 'skins':
      await taskDolls(true)
      break
    case 'coalition':
      await taskCoalition(false)
      break
    case 'coalitionSkins':
      await taskCoalition(true)
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
      + '  dolls            Fetch doll info\n'
      + '  skins            Fetch doll skins\n'
      + '  coalition        Fetch coalition doll info\n'
      + '  coalitionSkins   Fetch coalition doll skins\n'
      + '  npcs             Fetch npc illustrations\n'
      + '  backgrounds      Fetch background images'
  )
}

const dollCollectionPage = 'http://www.gfwiki.org/api.php?action=parse&prop=text&page=%E6%88%98%E6%9C%AF%E4%BA%BA%E5%BD%A2%E5%9B%BE%E9%89%B4&format=json'
async function getDolls(callback) {
  await fetch(dollCollectionPage)
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

async function taskDolls(wantsSkins) {
  const dollsJsPath = './src/assets/dolls.js'
  const skinsJsPath = './src/assets/skins.js'
  console.log('DOLLS: Updating doll data from gfwiki...')
  await getDolls(async (dolls) => {
    console.log('DOLLS: Collected ' + dolls.length + ' dolls.')
    console.log('DOLLS: Checking duplicates...')
    dolls = deduplicateDolls(dolls)
    console.log('DOLLS: Collected ' + dolls.length + ' dolls.')
    console.log('DOLLS: Saving to "' + dollsJsPath + '"...')
    await fs.writeFile(dollsJsPath,
                       'export const dolls = ' + JSON.stringify(dolls)
                      )
    console.log('DOLLS: Saved.')
    if(wantsSkins) {
      console.log('SKINS: Updating doll skins from gfwiki...')
      await getSkins(dolls, async (skins) => {
        console.log('SKINS: Saving to "' + skinsJsPath + '"...')
        await fs.writeFile(skinsJsPath,
                           'export const skins = ' + JSON.stringify(skins)
                          )
        console.log('SKINS: Saved.')
      })
    }
  })
}

const coalitionCollectionPage = 'http://www.gfwiki.org/api.php?action=parse&prop=text&page=%E8%9E%8D%E5%90%88%E5%8A%BF%E5%8A%9B%E5%9B%BE%E9%89%B4&format=json'
async function getCoalitionDolls(callback) {
  await fetch(coalitionCollectionPage)
    .then(response => {
      console.log("CDOLLs: Status: " + response.status)
      return response.json()
    }).then(async json => {
      var dom = new JSDOM(json.parse.text['*'])
      var coalitionDolls = []
      for(var div of
          dom.window.document.querySelectorAll('.sfdata[data-star="3"]')) {
        var doll = {}
        for(var attr of div.attributes) {
          if(attr.name.startsWith('data')) {
            if(attr.name === 'data-id') {
              doll['data-id'] = 'c' + attr.value
            } else {
              doll[attr.name] = attr.value
            }
          }
          if(!('data-tdoll-class' in doll)) {
            doll['data-tdoll-class'] = 'Coalition'
          }
          if(!('data-rarity' in doll)) {
            doll['data-rarity'] = '5'
          }
        }
        coalitionDolls.push(doll)
      }
      await callback(coalitionDolls)
    })
}

async function taskCoalition(wantsSkins) {
  const coalitionJsPath = './src/assets/coalition.js'
  const coalitionSkinsJsPath = './src/assets/coalitionSkins.js'
  console.log('CDOLLS: Updating coalition doll data from gfwiki...')
  await getCoalitionDolls(async (dolls) => {
    console.log('CDOLLS: Collected ' + dolls.length + ' dolls.')
    console.log('CDOLLS: Saving to "' + coalitionJsPath + '"...')
    await fs.writeFile(coalitionJsPath,
                       'export const coalitionDolls = ' + JSON.stringify(dolls)
                      )
    console.log('CDOLLS: Saved.')
    if(wantsSkins) {
      console.log('CSKINS: Updating coalition doll skins from gfwiki...')
      await getCoalitionSkins(dolls, async (skins) => {
        console.log('CSKINS: Saving to "' + coalitionSkinsJsPath + '"...')
        await fs.writeFile(coalitionSkinsJsPath,
                           'export const coalitionSkins = ' + JSON.stringify(skins)
                          )
        console.log('CSKINS: Saved.')
      })
    }
  })
}

async function getCoalitionSkins(dolls, callback) {
  var dollSkins = {}
  var count = 0
  var promises = []
  for(var doll of dolls) {
    var pageUrl = doll['data-url'] // '/w/THE_NAME'
    var url = 'http://gfwiki.org/api.php?action=parse&prop=wikitext&format=json&page=' + pageUrl.substring(3)
    var promise = (fetch(url, { retries: 3, retryDelay: 1000 })
      .then(response => response.json())
      .then(async json => {
        var skins = {}
        var wikitext = json.parse.wikitext['*']
            .replace(/<!--(.*?)-->/gm, '')
        var info = parseWikiTag(wikitext)
        for(var key of Object.keys(info).filter(
          key => key.startsWith('立绘')
        )) {
          var name = key
          var filename = info[key]
          skins[name] = getWikiMediaUrl(filename)
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
    // rapid fetching might cause problems
    await promise
    promises.push(promise)
  }
  await Promise.all(promises).then(async () => {
    await callback(dollSkins)
  })
}

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
  var dollsInformation = {} // we are fetching extra info now
  var count = 0
  var promises = []
  for(var doll of dolls) {
    var pageUrl = doll['data-url'] // '/w/THE_NAME'
    var url = 'http://gfwiki.org/api.php?action=parse&prop=wikitext&format=json&page=' + pageUrl.substring(3)
    var promise = (fetch(url, { retries: 3, retryDelay: 1000 })
      .then(response => response.json())
      .then(async json => {
        var skins = {}
        var dollInfo = {}
        var wikitext = json.parse.wikitext['*']
            .replace(/<!--(.*?)-->/gm, '')
        var info = parseWikiTag(wikitext)
        dollInfo.code = info.code
        dollInfo.cnname = doll['data-name-ingame']
        dollInfo.skins = {}
        addBothSkins(skins, doll['data-name-ingame'],
                     getDollDefaultSkinFilename(info.code))
        if(doll['data-mod'] === '1') {
          dollInfo.modded = true
          addBothSkins(skins, doll['data-name-ingame'] + 'MOD3',
                       getDollModSkinFilename(info.code))
        }

        for(var key of Object.keys(info).filter(
          key => key.startsWith('装扮') && key.endsWith('名称')
        )) {
          var name = info[key]
          var id = info['装扮' + key.substring(2, key.length - 2) + '编号']
          dollInfo.skins[id] = name
          addBothSkins(skins, name,
                       getDollSkinFilename(info.code, id))
        }
        dollSkins[doll['data-id']] = skins
        dollsInformation[doll['data-id']] = dollInfo
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
  const infoJsPath = './src/assets/info.js'
  await Promise.all(promises).then(async () => {
    await fs.writeFile(infoJsPath,
                       'export const info = ' + JSON.stringify(dollsInformation)
                      )
    console.log('INFO: Saved.')
    await callback(dollSkins)
  })
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
    await fs.writeFile(bgsJsPath,
                       'export const backgrounds = ' + JSON.stringify(backgrounds)
                      )
    console.log('BGs: Saved.')
  })
}

main()
