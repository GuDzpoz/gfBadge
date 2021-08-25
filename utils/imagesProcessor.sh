#!/bin/sh

if [ "$#" -lt 2 ]
then
    echo "Usage: $0 IMAGE_DIRECTORY OUTPUT_DIRECTORY [characters|skins|coalition|mergeAlpha|renameToLowerCase|optimize|thumbnails]"
    exit 1
fi

IMAGE_DIR="$1"
OUTPUT_DIR="$2"

mkdir -p "${OUTPUT_DIR}"

OLD_IFS="$IFS"

characters() {
    echo "Generating icons:"
    COUNT=1
    IFS=$'\n'
    for CARD_IMAGE in ${IMAGE_DIR}/*_N.png
    do
        echo "    ${COUNT}. ${doll}..."
        COUNT=`expr $COUNT + 1`
        doll=`basename "$CARD_IMAGE" | sed -e 's#^pic_##' -e 's#_N.png$##'`
        OUTPUT="${OUTPUT_DIR}/Icon_${doll}.png"
        if [ -e "${CARD_IMAGE}" ]
        then
            convert "${CARD_IMAGE}" -crop 160x160+48+24 "${OUTPUT}"
        else
            CARD_IMAGE="`find \"${IMAGE_DIR}\" -iname \"pic_${doll}_N.png\"`"
            convert "${CARD_IMAGE}" -crop 160x160+48+24 "${OUTPUT}"
        fi
    done
}

coalition() {
    echo "Generating coalition related files:"
    COUNT=1
    IFS=$'\n'
    for CARD_IMAGE in ${IMAGE_DIR}/pic_*_SS_1.png
    do
        echo "    ${COUNT}. ${doll}..."
        COUNT=`expr $COUNT + 1`
        doll=`basename "$CARD_IMAGE" | sed -e 's#^pic_##' -e 's#_SS_1.png##'`
        OUTPUT="${OUTPUT_DIR}/Icon_${doll}_SS_1.png"
        convert "${CARD_IMAGE}" -crop 160x160+172+60 "${OUTPUT}"
        CARD_IMAGE="${IMAGE_DIR}/pic_${doll}_SS.png"
        OUTPUT="${OUTPUT_DIR}/Icon_${doll}_SS.png"
        convert "${CARD_IMAGE}" -crop 160x160+172+60 "${OUTPUT}"
    done
}

optimize() {
    TOTAL=`ls ${IMAGE_DIR}/*.png | wc --lines`
    COUNT=1
    for image in ${IMAGE_DIR}/*.png
    do
        filename="`basename \"${image}\"`"
        echo "${COUNT}/${TOTAL} ${filename}"
        COUNT=`expr 1 + ${COUNT}`
        convert "${image}" -resize 1024x1024 /tmp/resized.png
        pngquant --force --skip-if-larger --output "${OUTPUT_DIR}/${filename}" -- /tmp/resized.png
    done
}

renameToLowerCase() {
    for upper in ${IMAGE_DIR}/Pic_*
    do
        lower="`basename \"${upper}\" | sed -e 's#^Pic#pic#'`"
        cp "${upper}" "${OUTPUT_DIR}/${lower}"
    done
}

mergeAlpha() {
    echo "Generating skins with transparency:"
    COUNT=1
    TOTAL=`ls ${IMAGE_DIR}/*_Alpha.png | wc --lines`
    for alphaImage in ${IMAGE_DIR}/*_Alpha.png
    do
        image="`echo ${alphaImage} | sed -e 's#_Alpha.png$##'`"
        imageName="`basename \"${image}\"`"
        echo "    ${COUNT}/${TOTAL}: ${image}.png"
        magick "${image}.png" -set option:dims "%wx%h" "${alphaImage}" -delete 0 -resize "%[dims]" /tmp/alpha.png
        convert "${image}.png" /tmp/alpha.png -compose copy-opacity -composite "${OUTPUT_DIR}/${imageName}.png"
        COUNT=`expr $COUNT + 1`
    done
}

thumbnails() {
    echo "Generating thumbnails:"
    COUNT=1
    TOTAL=`ls ${IMAGE_DIR}/*.png | wc --lines`
    for image in ${IMAGE_DIR}/*.png
    do
        imageName=`basename "${image}"`
        output="${OUTPUT_DIR}/${imageName}"
        if test -f "$output"
        then
            echo "    ${COUNT}/${TOTAL}: ${image} exists. Skipping..."
        else
            echo "    ${COUNT}/${TOTAL}: ${image}"
            convert "${image}" -resize 128x128 "$output"
        fi
        COUNT=`expr $COUNT + 1`
    done
}

if [ "$#" -eq 2 ]
then
    characters
    skins
elif [ "$#" -eq 3 ]
then
    if [ "$3" = "characters" ]
    then
        characters
    elif [ "$3" = "skins" ]
    then
        mergeAlpha
        renameToLowerCase
    elif [ "$3" = "coalition" ]
    then
        coalition
    elif [ "$3" = "mergeAlpha" ]
    then
        mergeAlpha
    elif [ "$3" = "renameToLowerCase" ]
    then
        renameToLowerCase
    elif [ "$3" = "optimize" ]
    then
        optimize
    elif [ "$3" = "thumbnails" ]
    then
        thumbnails
    fi
fi
