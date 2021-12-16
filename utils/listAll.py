import UnityPy
import os
import sys

if __name__ == "__main__":
    if len(sys.argv) != 2 and len(sys.argv) != 3:
        print("Usage:")
        print("    python %s <asset_dir> [type1,type2,...]" % sys.argv[0])
        print("")
        print("Default Types: Texture2D, Sprite, TextAsset")
    else:
        assetDir = sys.argv[1]
        types = ["Texture2D", "Sprite", "TextAsset"]
        getAll = False
        if len(sys.argv) == 3:
            if sys.argv == "all":
                getAll = True
            else:
                types = sys.argv[2].split(",")
        allAssets = os.listdir(assetDir)
        for asset in allAssets:
            if asset.endswith(".ab"):
                message = "===== %s =====" % asset
                print(message)
                print(message, file=sys.stderr)
                env = UnityPy.load(os.path.join(assetDir, asset))
                for obj in env.objects:
                    if getAll or obj.type in types:
                        data = obj.read()
                        print(data.name)
