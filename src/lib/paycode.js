var drawPayCode = function (qrcode, canvas, margin, logo, consumer = false) {
  var ctx = canvas.getContext("2d");
  var width = ctx.canvas.width;

  var cellCount = qrcode.getModuleCount();
  var cellRadius = (width - margin * 2) / cellCount / 2;
  var offset = cellRadius + margin;

  var iconPercent = 32 / 260;
  var iconClipPercent = 35 / 260;

  var logoPercent = 67 / 260;
  var logoClipPercent = 72 / 260;

  // white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, width);

  if (consumer) {
    // PayMe red
    ctx.fillStyle = "#db0011";
  } else {
    // PM4B red
    ctx.fillStyle = "#c92a23";
  }

  // top left eye
  drawEye(ctx, width, margin, cellRadius, 0, 0, offset);
  // top right eye
  drawEye(
    ctx,
    width,
    margin,
    cellRadius,
    2 * (cellCount - 7) * cellRadius,
    0,
    offset
  );
  // bottom left eye
  drawEye(
    ctx,
    width,
    margin,
    cellRadius,
    0,
    2 * (cellCount - 7) * cellRadius,
    offset
  );

  var iconWidth = (width - 2 * margin) * iconPercent;
  var logoWidth = (width - 2 * margin) * logoPercent;

  var iconClip =
    width - cellRadius - margin - (width - 2 * margin) * iconClipPercent;
  var logoLeftClip = width / 2 - ((width - 2 * margin) * logoClipPercent) / 2;
  var logoRightClip = width / 2 + ((width - 2 * margin) * logoClipPercent) / 2;

  // PayMe icon in bottom right
  drawIcon(ctx, iconWidth, width, margin, consumer);

  // business logo in the middle
  drawLogo(ctx, logo, logoWidth, width, margin, consumer);

  for (var r = 0; r < cellCount; r += 1) {
    for (var c = 0; c < cellCount; c += 1) {
      var x = c * cellRadius * 2 + offset;
      var y = r * cellRadius * 2 + offset;

      if (
        (r < 7 && (c < 7 || c > cellCount - 8)) ||
        (r > cellCount - 8 && c < 7)
      ) {
        // don't draw cells over the "eyes"
        continue;
      } else if (x >= iconClip && y >= iconClip) {
        // don't draw cells over the PM4B icon
        continue;
      } else if (
        x >= logoLeftClip &&
        x < logoRightClip &&
        y >= logoLeftClip &&
        y < logoRightClip
      ) {
        // don't draw cells over the logo
        continue;
      }

      if (qrcode.isDark(r, c)) {
        ctx.beginPath();
        ctx.arc(x, y, cellRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
};

var drawEye = function (
  ctx,
  width,
  margin,
  cellRadius,
  xOffset,
  yOffset,
  offset
) {
  // outer edge
  ctx.beginPath();
  ctx.moveTo(
    xOffset + 11 * cellRadius + margin,
    yOffset + 0 * cellRadius + margin
  );
  ctx.arcTo(
    xOffset + 14 * cellRadius + margin,
    yOffset + 0 * cellRadius + margin,
    xOffset + 14 * cellRadius + margin,
    yOffset + 3 * cellRadius + margin,
    3 * cellRadius
  );

  ctx.arcTo(
    xOffset + 14 * cellRadius + margin,
    yOffset + 14 * cellRadius + margin,
    xOffset + 12 * cellRadius + margin,
    yOffset + 14 * cellRadius + margin,
    3 * cellRadius
  );

  ctx.arcTo(
    xOffset + 0 * cellRadius + margin,
    yOffset + 14 * cellRadius + margin,
    xOffset + 0 * cellRadius + margin,
    yOffset + 11 * cellRadius + margin,
    3 * cellRadius
  );

  ctx.arcTo(
    xOffset + 0 * cellRadius + margin,
    yOffset + 0 * cellRadius + margin,
    xOffset + 3 * cellRadius + margin,
    yOffset + 0 * cellRadius + margin,
    3 * cellRadius
  );
  ctx.lineTo(
    xOffset + 11 * cellRadius + margin,
    yOffset + 0 * cellRadius + margin
  );

  // inner edge
  ctx.moveTo(
    xOffset + 4 * cellRadius + margin,
    yOffset + 2 * cellRadius + margin
  );
  ctx.arcTo(
    xOffset + 2 * cellRadius + margin,
    yOffset + 2 * cellRadius + margin,
    xOffset + 2 * cellRadius + margin,
    yOffset + 4 * cellRadius + margin,
    2 * cellRadius
  );

  ctx.arcTo(
    xOffset + 2 * cellRadius + margin,
    yOffset + 12 * cellRadius + margin,
    xOffset + 4 * cellRadius + margin,
    yOffset + 12 * cellRadius + margin,
    2 * cellRadius
  );

  ctx.arcTo(
    xOffset + 12 * cellRadius + margin,
    yOffset + 12 * cellRadius + margin,
    xOffset + 12 * cellRadius + margin,
    yOffset + 10 * cellRadius + margin,
    2 * cellRadius
  );

  ctx.arcTo(
    xOffset + 12 * cellRadius + margin,
    yOffset + 2 * cellRadius + margin,
    xOffset + 10 * cellRadius + margin,
    yOffset + 2 * cellRadius + margin,
    2 * cellRadius
  );
  ctx.lineTo(
    xOffset + 4 * cellRadius + margin,
    yOffset + 2 * cellRadius + margin
  );

  ctx.closePath();
  ctx.fill();

  // central rect
  ctx.beginPath();
  ctx.moveTo(
    xOffset + 8 * cellRadius + margin,
    yOffset + 4 * cellRadius + margin
  );
  ctx.arcTo(
    xOffset + 10 * cellRadius + margin,
    yOffset + 4 * cellRadius + margin,
    xOffset + 10 * cellRadius + margin,
    yOffset + 6 * cellRadius + margin,
    cellRadius
  );

  ctx.arcTo(
    xOffset + 10 * cellRadius + margin,
    yOffset + 10 * cellRadius + margin,
    xOffset + 8 * cellRadius + margin,
    yOffset + 10 * cellRadius + margin,
    cellRadius
  );

  ctx.arcTo(
    xOffset + 4 * cellRadius + margin,
    yOffset + 10 * cellRadius + margin,
    xOffset + 4 * cellRadius + margin,
    yOffset + 8 * cellRadius + margin,
    cellRadius
  );

  ctx.arcTo(
    xOffset + 4 * cellRadius + margin,
    yOffset + 4 * cellRadius + margin,
    xOffset + 6 * cellRadius + margin,
    yOffset + 4 * cellRadius + margin,
    cellRadius
  );
  ctx.lineTo(
    xOffset + 8 * cellRadius + margin,
    yOffset + 4 * cellRadius + margin
  );
  ctx.closePath();
  ctx.fill();
};

var drawIcon = function (ctx, iconWidth, width, margin, consumer) {
  var icon = new Image();

  var xOffset = width - margin - iconWidth;
  var yOffset = width - margin - iconWidth;

  // Apple design guidelines state that corner radius is 80px for a 512px icon
  var cornerRadius = (iconWidth * 80) / 512;
  var edgeLength = iconWidth - cornerRadius;

  icon.onload = function () {
    ctx.save();
    ctx.beginPath();

    ctx.moveTo(xOffset + edgeLength, yOffset);
    ctx.arcTo(
      xOffset + edgeLength + cornerRadius,
      yOffset,
      xOffset + edgeLength + cornerRadius,
      yOffset + cornerRadius,
      cornerRadius
    );

    ctx.arcTo(
      xOffset + edgeLength + cornerRadius,
      yOffset + edgeLength + cornerRadius,
      xOffset + edgeLength,
      yOffset + edgeLength + cornerRadius,
      cornerRadius
    );

    ctx.arcTo(
      xOffset,
      yOffset + edgeLength + cornerRadius,
      xOffset,
      yOffset + edgeLength,
      cornerRadius
    );

    ctx.arcTo(xOffset, yOffset, xOffset + cornerRadius, yOffset, cornerRadius);
    ctx.lineTo(xOffset + edgeLength, yOffset);
    ctx.closePath();

    ctx.clip();
    ctx.drawImage(icon, xOffset, yOffset, iconWidth, iconWidth);

    if (!consumer) {
      ctx.strokeStyle = "#767676";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.restore();
  };

  if (consumer) {
    icon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAkJggg==";
  } else {
    icon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICA";
  }
};

var drawLogo = function (ctx, img, logoWidth, width, margin, consumer) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, width / 2, logoWidth / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    img,
    (width - logoWidth) / 2,
    (width - logoWidth) / 2,
    logoWidth,
    logoWidth
  );

  if (!consumer) {
    // match PM4B app
    ctx.strokeStyle = "#e9e9e9";
    ctx.lineWidth = width * 0.015;
    ctx.stroke();
  }

  ctx.restore();
};

export { drawPayCode, drawEye, drawIcon };
