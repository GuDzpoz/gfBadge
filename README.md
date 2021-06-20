# gfwiki-badge

## Demo

The project is live on GitHub Pages https://gudzpoz.github.io/gfBadge/

## Project setup
```
yarn install
```

You would probably want to refresh information of dolls, illustrations, backgrounds etc.

Run
```
yarn update-data
```
to fetch such information from [GFWiki](www.gfwiki.org). It is going to take a while.

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

## License

This project is licensed under `GNU Affero General Public License v3.0`.

See [LICENSE](./LICENSE).

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
