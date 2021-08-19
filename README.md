# gfwiki-badge

## Demo

The project is live on [https://gf-badge.vercel.app/](https://gf-badge.vercel.app/) and also GitHub Pages [https://gudzpoz.github.io/gfBadge/](https://gudzpoz.github.io/gfBadge/).
The former one (the vercle one) is recommended as is the more up-to-date one.

## Project setup
```
yarn install
```

### Update doll info

You would probably want to refresh information of dolls, illustrations, backgrounds etc.

Run
```
yarn update-data
```
to fetch such information from [GFWiki](www.gfwiki.org). It is going to take a while, especially when it comes to skins.

More usages:
```
$ node update.js --help
update.js: Update doll data from GFWiki
Usage: 1) node update.js [option]
       2) yarn update-data [option]

Available option:
  --help, -h       Display this info
  dolls            Fetch doll info
  skins            Fetch doll skins
  coalition        Fetch coalition doll info
  coalitionSkins   Fetch coalition doll skins
  npcs             Fetch npc illustrations
  backgrounds      Fetch background images
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

#### Deploy
After `yarn build`, use:
```
yarn deploy
```
to commit and push the `dist` directory to remote `gh-pages` branch. If the project is hosted on GitHub, it will then be deploy in the corresponding GitHub Pages.

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Side Notes

As we are using local images now, we have to keep consistency with GFWiki, probably manually.

To do so, first make sure your files in `src/assets/` are committed to git, and `yarn update-data [options]` to update data. Then use `git diff` to check for changes.

I assume you are using Linux here.

After applying changes, you should `sh test.sh` to check for images that are still missing.

Our project here is currently requiring
```
src/assets/langs.js
src/assets/icons.js
src/assets/backgrounds.js
src/assets/npcs.js
```
as data sources (and all other files in `assets/` are just historical residues). And I will explain ways to keep them up-to-date.

#### `langs.js`

It is not relevant to the GFWiki so just update the translations by yourself.

#### `npcs.js`

First, `yarn update-data npcs` to fetch the lastest NPC info. Then you will need to indent the file correctly as follows:
```
export const npcs = {
    "克鲁格": {
        "克鲁格": "NPC-Kyruger.png"
    },
```

After this, you may `git diff src/assets/npcs.js` to chech for changes:
```
diff --git a/src/assets/npcs.js b/src/assets/npcs.js
index 8830e28..f98b51c 100644
--- a/src/assets/npcs.js
+++ b/src/assets/npcs.js
@@ -147,12 +147,5 @@ export const npcs = {
         "难民": "pic_NPC-Refugee_0.png",
         "女仆人形": "NPC-Maid.png",
         "以利亚": "NPC-Elijah(0).png"
-    },
-    "宝兰斯诺": {
-        "宝兰斯诺1": "NPC_baolan_1.png",
-        "宝兰斯诺2": "NPC_baolan_2.png",
-        "宝兰斯诺3": "NPC_baolan_3.png",
-        "宝兰斯诺4": "NPC_baolan_4.png",
-        "宝兰斯诺5": "NPC_baolan_5.png"
     }
 }
```
I added images for `baolan` manually so you will see that the NPC info on GFWiki has not changed and we should want to keep the older one (or else you should merge the two files manually). Use `git restore src/assets/npcs.js` to restore the the older version.

#### `backgrounds.js`

First `yarn update-data backgrounds` and then `git diff --word-diff-regex='\w' src/assets/backgrounds.js` to check for changes. As a matter of fact, `yarn update-data backgrounds` is not at all acquiring data from GFWiki. Instead, it always outputs some fixed filenames. So you will most likely not find any changes.

#### `icons.js`

`yarn update-data [options]` does not write to the `icons.js` file.

First, `yarn update-data coalition` to update `utils/coalition.json`. If coalition info is not changed, you may safely skip this.

Next, use `python3 utils/generateCompactData.py <asset_texttable.ab> /tmp utils/coalition.json` to generate the `icons.js`. You will need to get the newest version of `<asset_texttable.ab>` yourself. Move the file in place: `mv /tmp/icons.js src/assets/icons.js`.

Use `sh utils/test.sh` to check if you need to fetch some missing images. If so, `sh utils/test.sh > missings.txt` and then `mkdir /tmp/output && python3 utils/extractMissings.py missings.txt <asset_dir> /tmp/output`, where `<asset_dir>` is where you put all the `.ab` files. After this, extracted image files will be in `/tmp/output`.

To get usable images, `mkdir /tmp/final && mkdir /tmp/middle` and:
```
sh utils/imagesProcessor.sh /tmp/output /tmp/final character
sh utils/imagesProcessor.sh /tmp/output /tmp/final coalition
sh utils/imagesProcessor.sh /tmp/output /tmp/middle mergeAlpha
sh utils/imagesProcessor.sh /tmp/middle /tmp/final optimize
sh utils/copyMissingFiles.sh missings.txt /tmp/final public/images
```

Now `yarn serve` to check and commit your changes.

## License

This project is licensed under `GNU Affero General Public License v3.0`.

See [LICENSE](./LICENSE).

### gfWiki

The doll data (rarity, code names, etc.) mostly comes from [GFWiki](http://gfwiki.org/). The icon frame comes from one of its style sheets, which seems to be of [CC-BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/).

### gfBadge

This project used code from https://github.com/fc4soda/gfBadge , which is licensed under the MIT License:

```
MIT License

Copyright (c) 2019 fc4soda

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 媒体文件

上海暗冬网络科技有限公司 版权所有
SUNBORN Network Technology Co., Ltd. All Rights Reserved.
