const fs = require('fs')

const info = JSON.parse(fs.readFileSync('./src/assets/info.json').toString())
const coalitionSkins = JSON.parse(fs.readFileSync('./src/assets/coalitionSkins.json'))

if(process.argv[2] === 'characters') {
  console.log([].concat(
    Object.values(info).map(doll => doll.code),
    Object.values(info).filter(doll => doll.modded).map(doll =>
      doll.code + 'Mod'
    )
  ).join('\n'))
} else if(process.argv[2] === 'skins') {
  console.log([].concat(
    Object.values(info).map(doll => doll.code),
    Object.values(info).filter(doll => doll.modded).map(doll =>
      doll.code + 'Mod'
    ),
    ...Object.values(info).map(doll =>
      Object.keys(doll.skins).map(skin => doll.code + '_' + skin)
    )).join('\n'))
} else if(process.argv[2] === 'coalition') {
  console.log(
    Object.values(coalitionSkins).map(doll => {
      var url = doll['立绘2']
      var start = url.toLowerCase().indexOf('pic_') + 4
      var end = url.toLowerCase().lastIndexOf('_ll_1.png')
      return url.substring(start, end)
    }).join('\n')
  )
} else if(process.argv[2] === 'generate') {
  var data = JSON.parse(fs.readFileSync('./src/assets/dolls.json'))
  data = Object.fromEntries(data.map(doll =>
    [ doll['data-id'], doll ]
  ))
  // icons
  var icons = Object.fromEntries(Object.keys(info).map(id => {
    var doll = {}
    doll.type = data['' + id]['data-tdoll-class']
    doll.id = id
    doll.cnname = info[id].cnname
    doll.code = info[id].code
    doll.icon = 'Icon_' + doll.code + '.png'
    doll.modded = info[id].modded
    doll.rarity = Number.parseInt(data['' + id]['data-rarity'])
    if(doll.modded) {
      doll.moddedIcon = 'Icon_' + doll.code + 'Mod.png'
      doll.modRarity = Number.parseInt(data['' + id]['data-mod-rarity'])
    }
    doll.skins = Object.fromEntries([].concat(
      [
        [doll.cnname, 'pic_' + doll.code + '.png'],
        [doll.cnname + '（破）', 'pic_' + doll.code + '_D.png'],
      ],
      (doll.modded ?
      [
        [doll.cnname + ' Mod3', 'pic_' + doll.code + 'Mod.png'],
        [doll.cnname + ' Mod3（破）', 'pic_' + doll.code + 'Mod_D.png'],
      ] : []),
      [].concat(...Object.keys(info[id].skins).map(skinId => {
        return [
          [info[id].skins[skinId], 'pic_' + doll.code + '_' + skinId + '.png'],
          [info[id].skins[skinId] + '（破）', 'pic_' + doll.code + '_' + skinId + '_D.png']
               ]
      }))
    ))
    return [id, doll]
  }))
  var data = JSON.parse(fs.readFileSync('./src/assets/coalition.json'))
  data = Object.fromEntries(data.map(doll => [doll['data-id'], doll]))
  Object.assign(icons, Object.fromEntries(Object.keys(coalitionSkins).map(id => {
    var doll = {}
    var url = coalitionSkins[id]['立绘2']
    var start = url.toLowerCase().indexOf('pic_') + 4
    var end = url.toLowerCase().lastIndexOf('_ll_1.png')
    var name = url.substring(start, end)
    doll.id = id
    doll.type = 'SF'
    doll.modded = false
    doll.cnname = data[id]['data-name-ingame']
    doll.code = name
    doll.rarity = 6
    doll.icon = 'Icon_' + doll.code + '_SS_1.png'
    doll.skins = {}
    doll.skins[doll.cnname] = 'pic_' + doll.code + '_LL.png'
    doll.skins[doll.cnname + '（五星）'] = 'pic_' + doll.code + '_LL_1.png'
    return [id, doll]
  })))
  icons['_'] = '/images/icons'
  icons['__'] = '/images/skins'
  fs.writeFileSync('./src/assets/icons.js',
                   'export const icons = ' + JSON.stringify(icons)
                  )
}
