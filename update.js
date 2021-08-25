/* eslint-disable */

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
      + '  npcs             Fetch npc illustrations\n'
      + '  backgrounds      Fetch background images'
  )
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
                       'export const npcs = ' + JSON.stringify(NPCData, null, 4)
                      )
    console.log('NPCs: Saved.')
  })
}

async function getBackgrounds(callback) {
  var backgrounds = []
  files = await fs.readdir('public/images/backgrounds', { withFileTypes: true })
  files.forEach(file => {
    if(file.isFile()) {
      backgrounds.push(file.name)
    }
  })
  await callback(backgrounds)
}

async function taskBackgrounds() {
  const bgsJsPath = './src/assets/backgrounds.js'
  console.log('BGs: Computing background image urls...')
  await getBackgrounds(async (backgrounds) => {
    console.log('BGs: Collected ' + backgrounds.length + ' background images.')
    console.log('BGs: Saving to "' + bgsJsPath + '"...')
    backgrounds['_'] = './images/backgrounds'
    await fs.writeFile(bgsJsPath,
                       'export const backgrounds = ' + JSON.stringify(
                         {
                           '_': '/images/backgrounds',
                           '__': '/images/backgrounds/thumbnails',
                           'bg': backgrounds
                         }, null, 4)
                      )
    console.log('BGs: Saved.')
  })
}

main()
