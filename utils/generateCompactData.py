import UnityPy
import sys
import os
import requests
import json

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

cdnUrl = "https://cdn.jsdelivr.net/gh/Innnsane/GFwiki-Automation@main/w_stc_data/"
def downloadStcJsonData(files, outputDir):
    data = {}
    for name in files:
        url = cdnUrl + name
        r = requests.get(url)
        data[name] = r.json()
        with open(os.path.join(outputDir, name), "wb") as f:
            f.write(r.content)
    return data

gunTypes = [None, "HG", "SMG", "RF", "AR", "MG", "SG"]
def generateCompactData(gunInfo, skinInfo, textTable, coalition):
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
        gunId = gun["id"]
        if isGunDoll(gunId):
            cnName = textTable[gun["name"]]
            enName = gun["en_name"]
            code = gun["code"]
            rarity = getGeneralRarity(gunId, gun["rank"])
            gunType = getGunType(gun["type"])
            data[gunId] = {
                "type": gunType,
                "id": gunId,
                "cnname": cnName,
                "enname": enName,
                "code": code,
                "icon": "Icon_%s.png" % code,
                "modded": False,
                "rarity": rarity,
                #"moddedIcon": ,
                #"modRarity": rarity,
                "skins": {
                    cnName: "pic_%s.png" % code,
                    (cnName + "（破）"): "pic_%s_D.png" % code,
                },
            }
    for gun in gunInfo:
        gunId = gun["id"]
        if isModded(gunId):
            originalId = getOriginalId(gunId)
            gunData = data[originalId]
            gunData["modded"] = True
            gunData["moddedIcon"] = "Icon_%sMod.png" % gunData["code"]
            gunData["modRarity"] = getGeneralRarity(originalId, gun["rank"])
            gunData["skins"][gunData["cnname"] + " Mod3"] = "pic_%sMod.png" % gunData["code"]
            gunData["skins"][gunData["cnname"] + " Mod3（破）"] = "pic_%sMod_D.png" % gunData["code"]
    for skin in skinInfo:
        gunId = skin["fit_gun"]
        if gunId != "-1" and isGunDoll(gunId):
            gun = data[gunId]
            cnName = textTable[skin["name"]]
            firstName = "pic_%s_%s" % (gun["code"], skin["id"])
            gun["skins"][cnName] = firstName + ".png"
            gun["skins"][cnName + "（破）"] = firstName + "_D.png"
    return data

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage:")
        print("  python3 %s <asset_texttable.ab> <output_dir> <coalition>" % sys.argv[0])
        exit(-1)
    else:
        outputDir = sys.argv[2]
        table = parseAndMergeTable(exportTextTable(sys.argv[1], ["skin", "gun"], outputDir))
        data = downloadStcJsonData(["gun_info.json", "skin_info.json"], outputDir)
        gunInfo = data["gun_info.json"]
        skinInfo = data["skin_info.json"]
        icons = None
        with open(sys.argv[3]) as f:
            icons = json.load(f)
        icons = generateCompactData(gunInfo, skinInfo, table, icons)
        icons["_"] = "/images/icons"
        icons["__"] = "/images/skins"
        with open(os.path.join(outputDir, "icons.js"), "wb") as f:
            f.write(bytes("export const icons = " + json.dumps(icons, ensure_ascii=False, separators=(',', ':')), "utf-8"))
