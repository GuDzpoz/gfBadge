// modified from https://github.com/fc4soda/gfBadge

function drawBox(ctx, x, y, w, h, lineWidth, percent) {
  let grd = ctx.createLinearGradient(x, 0, x + w, 0);
  grd.addColorStop(0, "#b30000");
  grd.addColorStop(0.5, "#ffff00");
  grd.addColorStop(1, "#47d147");
  ctx.fillStyle = grd;
  ctx.lineWidth = lineWidth;
  ctx.fillRect(x, y, Math.floor(percent * w), h);
  ctx.strokeRect(x, y, w, h);
}

function drawGun(ctx, img, gunInfo, R, lineWidth) {
  return drawHexagonImg(ctx, img, gunInfo.img, gunInfo.x, gunInfo.y, R, gunInfo.fillColor, gunInfo.fillColor, lineWidth);
}

function drawGunBlank(ctx, gunInfo, R, lineWidth) {
  drawHexagon(ctx, gunInfo.x, gunInfo.y, R, gunInfo.fillColor, 'black', lineWidth);
}

function drawHexagonImg(ctx, image, newSrc, x0, y0, R, fillColor, strokeStyle, lineWidth) {
  let numberOfSides = 6,
      size = R,
      x = x0,
      y = y0
      // fx = Math.cos(1 / 6 * Math.PI)
      // w = size * 2 * fx,
      // h = size * 2,
      // Xcenter = fx * size,
      // Ycenter = size;


  let fun = function () {
    ctx.save();
    ctx.lineWidth = lineWidth;
    // outer line
    ctx.beginPath();
    ctx.moveTo(x0 + Math.floor(size * Math.sin(0)), y0 + Math.floor(size * Math.cos(0)));
    for (let i = 1; i <= numberOfSides; i++) {
      ctx.lineTo(x0 + size * Math.sin(i * 2 * Math.PI / numberOfSides), y0 + size * Math.cos(i * 2 * Math.PI / numberOfSides));
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, 0, 0, image.width, image.width, Math.floor(x - size), y - size, 2 * size, 2 * size);
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.restore();
  }
  return fun;
}



function drawHexagon(ctx, Xcenter, Ycenter, size, fillColor, strokeStyle, lineWidth, alpha) {
  let numberOfSides = 6;

  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = alpha // UIData[currentCanvas]["guns"]["alpha"];
  // fill hexagon
  ctx.beginPath();
  ctx.moveTo(Xcenter + size * Math.sin(0), Ycenter + size * Math.cos(0));
  for (let i = 1; i <= numberOfSides; i++) {
    ctx.lineTo(Xcenter + size * Math.sin(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.cos(i * 2 * Math.PI / numberOfSides));
  }
  ctx.fillStyle = fillColor;
  ctx.fill();
  // outer line
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(Xcenter + size * Math.sin(0), Ycenter + size * Math.cos(0));
  for (let i = 1; i <= numberOfSides; i++) {
    ctx.lineTo(Xcenter + size * Math.sin(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.cos(i * 2 * Math.PI / numberOfSides));
  }
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

function drawUserAvatar(ctx, userAvatar) {
  let c = userAvatar;
  let img = new Image();
  img.onload = function () {
    // resize and cut to fit avatar box
    let sw = img.width, sh = img.height,
        dw = c.w, dh = c.h;
    //ctx.clearRect(c.x,c.y,dw,dh);
    let xs = 0, ys = 0, ws = 0, hs = 0, f = 0;
    if (sw < sh) {
      xs = 0, ws = sw, f = sw / dw, ys = 0.5 * (sh - dh * f), hs = dh * f;
    } else {
      ys = 0, hs = sh, f = sh / dh, xs = 0.5 * (sw - dw * f), ws = dw * f;
    }
    ctx.drawImage(img, xs, ys, ws, hs, c.x, c.y, dw, dh);
  };
  img.src = userAvatar.url;
}

function drawText(ctx, content, x, y, font, fillStyle, lineWidth, strokeStyle, align, baseline) {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (lineWidth > 0) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.strokeText(content, x, y);
  }
  ctx.fillStyle = fillStyle;
  ctx.fillText(content, x, y);
}

function initGunPosition(xPos, yPos, R, gunList, limit, gap) {
  let // typeSum = Object.keys(gunList).length,
      fx = Math.cos(1 / 6 * Math.PI),
      // fy = R,
      fyy = Math.sin(1 / 6 * Math.PI),
      result = { "guns": {}, "text": {} };
  // let delta = 1;
  let jPrev = 1, sum = 0, tt = 0;
  for (let t in gunList) {
    let l = gunList[t].length;
    if (l > 0) {
      for (let i = 0; i < l; i++) {
        //x = xPos+fx*R*(2*i+j%2);
        //y = yPos+j*R*(2-fyy);
        let ii = i % limit,
            jj = jPrev + Math.floor(i / limit),
            x = xPos + fx * R * (2 * ii + (jj + 1) % 2),
            y = yPos + jj * R * (2 - fyy) + tt * gap;
        let stars = gunList[t][i].stars, fillColor = "";
        switch (stars) {
        case 2:
          fillColor = star2;
          break;
        case 3:
          fillColor = star3;
          break;
        case 4:
          fillColor = star4;
          break;
        case 5:
          fillColor = star5;
          break;
        case 6:
          fillColor = star6;
          break;
        case 'ex':
          fillColor = starEx;
          break;
        default:
          fillColor = star2;
        }
        result.guns[gunList[t][i].no] = {
          "x": Math.floor(x),
          "y": Math.floor(y),
          "fillColor": fillColor,
          "img": 'http:' + gunList[t][i]['data-rarity'] };
        if (i == 0) {
          result.text[t] = {};
          result.text[t].name = { "x": Math.floor(x - fx * R), "y": Math.floor(y), "text": t };
          if (jPrev % 2 == 0) { result.text[t].name.x -= Math.floor(fx * R) }
        }
        if (i == (l - 1)) { result.text[t].num = { "x": Math.floor(x + fx * R), "y": Math.floor(y), "text": l }; }
      }
      jPrev += Math.floor((l - 1) / limit + 1);
      tt++;
      sum += l;
    }
  }
  result.sum = sum;
  return result;
}

const star6 = '#ff4d4d',
      star5 = '#ffb24d',
      star4 = '#d4dca9',
      star3 = '#b3e6ff',
      star2 = 'white',
      starEx = '#ccb3ff';

function initGunPosition2(xPos, yPos, R, gunList, limitMap, gap) {
  let // typeSum = Object.keys(gunList).length,
      fx = Math.cos(1 / 6 * Math.PI),
      // fy = R,
      fyy = Math.sin(1 / 6 * Math.PI),
      result = { "guns": {}, "text": {} };
  // let delta = 1;
  let jPrev = 1, sum = 0, tt = 0;
  for (let t in gunList) {
    let limit = limitMap[t];
    let l = gunList[t].length;
    if (l > 0) {
      for (let i = 0; i < l; i++) {
        //x = xPos+fx*R*(2*i+j%2);
        //y = yPos+j*R*(2-fyy);
        let ii = i % limit,
            jj = jPrev + Math.floor(i / limit),
            x = xPos + fx * R * (2 * ii + (jj + 1) % 2),
            y = yPos + jj * R * (2 - fyy) + tt * gap;
        let stars = gunList[t][i].rarity, fillColor = "";
        switch (stars) {
        case 2:
          fillColor = star2;
          break;
        case 3:
          fillColor = star3;
          break;
        case 4:
          fillColor = star4;
          break;
        case 5:
          fillColor = star5;
          break;
        case 6:
          fillColor = star6;
          break;
        case 1:
          fillColor = starEx;
          break;
        default:
          fillColor = star2;
        }
        result.guns[gunList[t][i].id] = {
          "x": Math.floor(x),
          "y": Math.floor(y),
          "fillColor": fillColor,
          "img": (gunList[t][i].icon)
        };
        if (i == 0) {
          result.text[t] = {};
          result.text[t].name = { "x": Math.floor(x - fx * R), "y": Math.floor(y), "text": t };
          if (jPrev % 2 == 0) { result.text[t].name.x -= Math.floor(fx * R) }
        }
        if (i == (l - 1)) { result.text[t].num = { "x": Math.floor(x + fx * R), "y": Math.floor(y), "text": l }; }
      }
      jPrev += Math.floor((l - 1) / limit + 1);
      tt++;
      sum += l;
    }
  }
  result.sum = sum;
  return result;
}

export {
  drawBox,
  drawGun,
  drawGunBlank,
  drawHexagonImg,
  drawHexagon,
  drawUserAvatar,
  drawText,
  initGunPosition,
  initGunPosition2
}
