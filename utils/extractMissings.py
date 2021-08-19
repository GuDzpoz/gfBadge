import UnityPy
import os
import sys
import re

trailingNumberPattern = re.compile(r"_\d+$")
def splitFilename(filename):
    match = trailingNumberPattern.search(filename)
    if match == None:
        return filename, None
    else:
        return filename[:match.start()], match.group()[1:]

def getDollInfo(missingFilename):
    if missingFilename.endswith(".png"):
        if missingFilename.startswith("Icon_"):
            if missingFilename.endswith("_SS_1.png"):
                return missingFilename[5:-9], "sficon", 0
            else:
                return missingFilename[5:-4], "icon", 0
        elif missingFilename.startswith("pic_"):
            name = missingFilename[4:-4]
            damaged = False
            if name.endswith("_LL"):
                return name[:-3], "sf" , damaged
            if name.endswith("_LL_1"):
                return name[:-5], "sf" , damaged
            if name.endswith("_D"):
                name = name[:-2]
            dollName, skinId = splitFilename(name)
            if skinId == None:
                return dollName, "doll" , damaged
            else:
                return dollName, "skin", skinId
        else:
            print("Unrecognized image: %s" % missingFilename)
            return "", None, None
    else:
        print("Missing file is expected to be an PNG image: %s" % missingFilename)
        return "", None, None

def findMatchingString(string, stringSet):
    result = None
    for s in stringSet:
        if s.find(string) != -1:
            if result == None:
                result = s
            else:
                print("Matching multiple files: %s" % result)
                result = s
    return result

def matchFile(dollName, missingType, skinId, allAssets):
    filename = "character" + dollName.replace(' ', '').replace('_', '').lower()
    if missingType == "skin":
        filename += skinId
    match = findMatchingString(filename + ".ab", allAssets)
    if match == None:
        match = findMatchingString(filename + "he.ab", allAssets)
    return match

def extractSelectedTextures(path, isWanted, outputDir):
    env = UnityPy.load(path)
    for obj in env.objects:
        if obj.type == "Texture2D":
            data = obj.read()
            if isWanted(data.name):
                imagePath = os.path.join(outputDir, data.name + ".png")
                data.image.save(imagePath)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage:")
        print("    python %s <missings.txt> <asset_dir> <output_dir>" % sys.argv[0])
    else:
        missings = []
        with open(sys.argv[1], "r") as f:
            missings = f.read().split("\n")
        assetDir = sys.argv[2]
        outputDir = sys.argv[3]
        allAssets = os.listdir(assetDir)
        assets = {}
        assetNames = {}
        for filename in missings:
            filename = filename.strip()
            if filename != "":
                dollName, missingType, skinId = getDollInfo(filename)
                assetFile = matchFile(dollName, missingType, skinId, allAssets)
                if assetFile == None:
                    print("None matched: %s" % dollName)
                if assetFile in assets:
                    assets[assetFile].append(missingType)
                else:
                    assets[assetFile] = [missingType]
                    assetNames[assetFile] = dollName
        for asset in assets.keys():
            if "skin" in assets[asset]:
                extractSelectedTextures(os.path.join(assetDir, asset),
                                        # skin assets contain only skins
                                        lambda name: name.lower().find("_hd_") == -1,
                                        outputDir)
            elif "sf" in assets[asset] or "sficon" in assets[asset]:
                def sfSelector(name):
                    return name.lower().find("_hd_") == -1
                extractSelectedTextures(os.path.join(assetDir, asset),
                                        sfSelector,
                                        outputDir)
            else:
                dollName = assetNames[asset]
                def selectedNeed(assetName):
                    assetName = assetName.lower()
                    if assetName.endswith("_alpha"):
                        assetName = assetName[:-6]
                    if assetName.endswith("_d"):
                        assetName = assetName[:-2]
                    if assetName.endswith("_n"):
                        return "icon" in assets[asset]
                    elif assetName.endswith(dollName.lower()):
                        return "doll" in assets[asset]
                    else:
                        return False
                extractSelectedTextures(os.path.join(assetDir, asset),
                                        selectedNeed,
                                        outputDir)
