#!/bin/sh

if [ "$#" -lt 2 ]
then
    echo "Usage: $0 MISSINGS IMAGE_DIRECTORY OUTPUT_DIRECTORY"
    exit 1
fi

IMAGE_DIRECTORY="$2"
OUTPUT_DIRECTORY="$3"
cat "$1" | while read line 
do
    case "$line" in
        Icon*)
            mv "${IMAGE_DIRECTORY}/$line" "${OUTPUT_DIRECTORY}/icons/"
        ;;
        *)
            mv "${IMAGE_DIRECTORY}/$line" "${OUTPUT_DIRECTORY}/skins/"
        ;;
    esac
done
