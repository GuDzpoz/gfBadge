
IFS=$'\n'
for i in `cat src/assets/icons.js | tr -cd '\11\12\15\40-\176' | sed -e 's#"pic_#\npic_#g' -e 's#"Icon_#\nIcon_#g' | sed -e 's#.png.*$#.png#g' | grep --regexp='pic_\|Icon' | grep --invert-match moddedIcon`
do
  if [ -f "public/images/skins/$i" ]
  then
    true
  elif [ -f "public/images/icons/$i" ]
  then
    true
  else
    echo $i
  fi
done
for i in `cat src/assets/npcs.js | sed -e 's#":\s*"#\n#g' | sed -e 's#.png.*$#.png#g' | grep .png`
do
  if [ -f "public/images/skins/$i" ]
  then
    true
  else
    echo $i
  fi
done

