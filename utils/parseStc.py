import json
import sys
import os
import requests
from struct import unpack_from
from struct import calcsize

def readFile(filename):
    with open(filename, "rb") as f:
        return f.read()

columnTypeMap = {
    1: "<b",
    5: "<i",
    8: "<q",
    9: "<f",
    11: "s",
}
def readColumnInfo(f, col, offset):
    # might throw KeyError
    info = tuple(map(lambda byte: columnTypeMap[byte],
               unpack_from("<" + ("B" * col), f, offset)))
    return info, offset + col

def readRow(f, columns, offset):
    row = []
    for typeName in columns:
        if typeName == "s":
            offset += 1
            length = unpack_from("<H", f, offset)[0]
            offset += 2
            row.append(unpack_from("<" + str(length) + "s",
                                   f, offset)[0]
                       .decode("utf-8"))
            offset += length
        else:
            row.append(unpack_from(typeName, f, offset)[0])
            offset += calcsize(typeName)
    return row, offset

def readColumnNames(filename):
    with open(filename, "r") as f:
        content = f.read()
        return tuple(map(lambda s: s.strip(), content.split("\n")))

outputs = {
    "5005": "gun",
    "5048": "skin",
    "5090": "enemy_illustration",
}
def getOutputPath(stcFile, outputDir):
    number = os.path.basename(stcFile).split(".")[0]
    if number in outputs:
        return os.path.join(outputDir, outputs[number] + ".json")
    else:
        return os.path.join(outputDir, number + ".json")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage:")
        print("    python3 %s <stc_file> <stc_format_file> <output_dir>" % sys.argv[0])
        exit(-1)
    filename = sys.argv[1]
    columnNames = readColumnNames(sys.argv[2])
    f = readFile(filename)
    code, noIdea, rowCount, colCount = unpack_from("<HHHB", f, offset=0)
    columns, offset = readColumnInfo(f, colCount, 7)
    offset = unpack_from("<II", f, offset)[1]
    data = []
    for i in range(rowCount):
        row, offset = readRow(f, columns, offset)
        data.append(dict(zip(columnNames, row)))
    with open(getOutputPath(filename, sys.argv[3]), "wb") as f:
        f.write(bytes(json.dumps(data, ensure_ascii=False, indent=4), "utf-8"))
