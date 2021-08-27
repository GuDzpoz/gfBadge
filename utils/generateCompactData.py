import UnityPy
import sys
import os
import requests
import json
from collections import OrderedDict

def exportTextTable(path, wanted, outputDir):    
    env = UnityPy.load(path)
    contents = {}
    for obj in env.objects:
        data = obj.read()
        if data.name in wanted:
            if obj.type == "TextAsset":
                with open(os.path.join(outputDir, data.name), "wb") as f:
                    content = bytes(data.script)
                    f.write(content)
                    contents[data.name] = content.decode("utf-8")
    return contents

def parseAndMergeTable(contents):
    table = {}
    for content in contents.values():
        for line in content.split("\n"):
            pair = line.strip().split(",", 1)
            if len(pair) == 2:
                table[pair[0]] = pair[1]
    return table

cdnStcUrl = "https://cdn.jsdelivr.net/gh/randomqwerty/GFLData@main/ch/stc/"
#cdnUrl = "https://cdn.jsdelivr.net/gh/Innnsane/GFwiki-Automation@main/w_stc_data/"
def downloadStcJsonData(files, stcJsonDir):
    data = {}
    for name in files:
        path = os.path.join(stcJsonDir, name)
        with open(path, "r") as f:
            data[name] = json.load(f)
    return data

cdnTextUrl = "https://cdn.jsdelivr.net/gh/randomqwerty/GFLData@main/%s/text/table/"
translationTables = {
    "gun.json": "gun",
    "enemy_illustration.json": "coalition",
    "skin.json": "skin",
}
translations = ["kr", "jp", "en"]
def downloadTranslationTables(outputDir):
    langs = {}
    for lang in translations:
        data = {}
        langDir = os.path.join(outputDir, lang)
        if not os.path.exists(langDir):
            os.mkdir(langDir)
        else:
            if not os.path.isdir(langDir):
                print("Please remove %s." % langDir)
                exit(-1)
        for name in translationTables:
            url = (cdnTextUrl % lang) + name
            print("Downloading %s..." % url)
            r = requests.get(url)
            data[translationTables[name]] = r.json()
            with open(os.path.join(langDir, name), "wb") as f:
                f.write(r.content)
        langs[lang] = data
    return langs

def translateObject(obj, group, key, translationTables, suffix=""):
    for lang in translations:
        if key in translationTables[lang][group]:
            obj[lang] = translationTables[lang][group][key] + suffix
    return obj

def getDefaultSkin(doll, languages, defaultLanguage, icon=None, alt=None):
    skin = {defaultLanguage: doll[defaultLanguage]}
    for lang in languages:
        if lang in doll:
            skin[lang] = doll[lang]
    if icon != None:
        skin['icon'] = icon
    if alt != None:
        skin['alt'] = alt
    return skin

def generateCoalitionData(coalitionInfo, textTable, translationTables):
    data = {}
    for info in reversed(coalitionInfo):
        if info["type"] == 1 and info["if_capture"] == 1:
            dollId =  "c" + str(info["id"])
            cnname = textTable[info["name"]]
            code = info["code"]
            doll = {
                "type": "SF",
                "rarity": 6,
                "modded": False,
                "skins": {},
                "id": dollId,
                "cn": cnname,
                "code": code,
                "icon": "Icon_%s_SS_1.png" % code,
            }
            translateObject(doll, "coalition", info["name"], translationTables)
            doll["skins"]["pic_%s_LL.png" % code] = getDefaultSkin(
                doll, translations, "cn", None, "pic_%s_LL_1.png" % code)
            data[dollId] = doll
    return data

gunTypes = [None, "HG", "SMG", "RF", "AR", "MG", "SG"]
def generateCompactData(gunInfo, skinInfo, textTable, coalition, translationTables):
    def getGunType(gunTypeNum):
        return gunTypes[int(gunTypeNum)]
    def isExtra(gunId):
        return len(gunId) == 4 and gunId[0] == "1"
    def isModded(gunId):
        return len(gunId) == 5 and gunId[0] == "2"
    def getOriginalId(moddedId):
        return moddedId[1:].lstrip("0")
    def isGunDoll(gunId):
        if len(gunId) <= 3:
            # normal dolls
            return True
        elif isExtra(gunId):
            # extra dolls
            return True
        elif len(gunId) == 4 and gunId[0] == "9":
            # plot characters
            return False
        elif isModded(gunId):
            # mod dolls, should be merged into normal dolls
            return False
        elif len(gunId) == 5 and gunId[0] == "3":
            # i dunno ?
            return False
        else:
            return False
    def getGeneralRarity(gunId, rarity):
        if isExtra(gunId):
            return 1
        else:
            return int(rarity)
    data = coalition
    for gun in gunInfo:
        gunId = str(gun["id"])
        if isGunDoll(gunId):
            cnName = textTable[gun["name"]]
            code = gun["code"]
            rarity = getGeneralRarity(gunId, gun["rank"])
            gunType = getGunType(gun["type"])
            data[gunId] = {
                "type": gunType,
                "id": gunId,
                "cn": cnName,
                "code": code,
                "icon": "Icon_%s.png" % code,
                "modded": False,
                "rarity": rarity,
                #"moddedIcon": ,
                #"modRarity": rarity,
                "skins": {},
            }
            translateObject(data[gunId], "gun", gun["name"], translationTables)
            data[gunId]["skins"]["pic_%s.png" % code] = getDefaultSkin(
                data[gunId], translations, "cn", None, "pic_%s_D.png" % code)
    for gun in gunInfo:
        gunId = str(gun["id"])
        if isModded(gunId):
            originalId = getOriginalId(gunId)
            gunData = data[originalId]
            gunData["modded"] = True
            gunData["moddedIcon"] = "Icon_%sMod.png" % gunData["code"]
            gunData["modRarity"] = getGeneralRarity(originalId, gun["rank"])
            gunData["skins"]["pic_%sMod.png" % gunData["code"]] = getDefaultSkin(
                gunData, translations, "cn", "mod",
                "pic_%sMod_D.png" % gunData["code"])
    for skin in skinInfo:
        gunId = str(skin["fit_gun"])
        if gunId != "-1" and isGunDoll(gunId):
            gun = data[gunId]
            cnName = textTable[skin["name"]]
            firstName = "pic_%s_%s" % (gun["code"], str(skin["id"]))
            gun["skins"][firstName + ".png"] = translateObject(
                {
                    "cn": cnName,
                    "icon": "Icon_%s_%s.png" % (gun["code"], str(skin["id"])),
                    "alt": firstName + "_D.png",
                }, "skin", skin["name"], translationTables)
    return data

def getOrderedDict(icons):
    def keyingId(key):
        if key[0] == "c":
            return int(key[1:]) - 100000
        elif key == "_":
            return 0
        elif key == "__":
            return 0.5
        else:
            try:
                return int(key)
            except Exception:
                return 0
    data = OrderedDict(
        map(lambda key: (key, icons[key]),
            sorted(icons.keys(), key=keyingId)
            ))
    return data

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage:")
        print("  python3 %s <asset_texttable.ab> <stc_json_dir> <output_dir>" % sys.argv[0])
        exit(-1)
    else:
        outputDir = sys.argv[3]
        table = parseAndMergeTable(exportTextTable(sys.argv[1], ["skin", "gun", "enemy_illustration"], outputDir))
        data = downloadStcJsonData(
            ["gun.json", "skin.json", "enemy_illustration.json"],
            sys.argv[2])
        translationTables = downloadTranslationTables(outputDir)
        gunInfo = data["gun.json"]
        skinInfo = data["skin.json"]
        icons = generateCoalitionData(
            data["enemy_illustration.json"],
            table,
            translationTables
        )
        icons = generateCompactData(gunInfo,
                                    skinInfo,
                                    table,
                                    icons,
                                    translationTables)
        icons["_"] = "/images/icons"
        icons["__"] = "/images/skins"
        icons = getOrderedDict(icons)
        with open(os.path.join(outputDir, "icons.js"), "wb") as f:
            f.write(
                bytes("export const icons = "
                      + json.dumps(
                          icons,
                          ensure_ascii=False,
                          indent=4
                      ),
                      "utf-8"))
