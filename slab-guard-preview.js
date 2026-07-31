let cachedGuardLayer = null;
let cachedDividerLayer = null;
let cachedInnerEdgeLayer = null;
let cachedGuardColor = null;

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

const upload = document.getElementById('slabUpload');

// const guardColor = document.getElementById('guardColor');
let guardColor = {
   value: '#FFFFFF'
};
const hexValue = document.getElementById('hexValue');

const zoom = document.getElementById('zoom');
const offsetX = document.getElementById('offsetX');
const offsetY = document.getElementById('offsetY');

const zoomValue = document.getElementById('zoomValue');
const offsetXValue = document.getElementById('offsetXValue');
const offsetYValue = document.getElementById('offsetYValue');

const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

let slabImage = null;

function rebuildGuardLayersIfNeeded() {
   const color = guardColor.value.toUpperCase();

   if (
      cachedGuardLayer &&
      cachedDividerLayer &&
      cachedInnerEdgeLayer &&
      cachedGuardColor === color
   ) {
      return;
   }

   cachedDividerLayer = makeDividerLayer();
   cachedInnerEdgeLayer = makeInnerEdgeLayer();
   cachedGuardLayer = makeGuardLayer();
   cachedGuardColor = color;
}

function seededRandom(seed) {
   let value = seed;

   return () => {
      value = Math.sin(value) * 20;
      return value - Math.floor(value);
   };
}

function drawGalaxySparklesInRect(
   context,
   x,
   y,
   width,
   height,
   count,
   seed
) {
   context.save();

   context.beginPath();
   context.rect(x, y, width, height);
   context.clip();

   const random = seededRandom(seed);

   const sparkleColors = [
      'rgba(32,220,255,.95)',
      'rgba(77,240,255,.85)',
      'rgba(185,250,255,.95)',
      'rgba(255,255,255,.85)'
   ];

   for (let i = 0; i < count; i++) {
      const sparkleX = x + random() * width;
      const sparkleY = y + random() * height;

      const radius =
         random() > 0.94
            ? 0.6 + random() * 0.5
            : 0.2 + random() * 0.2;

      context.beginPath();
      context.arc(
         sparkleX,
         sparkleY,
         radius,
         0,
         Math.PI * 2
      );

      context.fillStyle =
         sparkleColors[
         Math.floor(random() * sparkleColors.length)
         ];

      context.fill();
   }

   context.restore();
}

function drawGalaxySparkles(
   context,
   outerX,
   outerY,
   outerW,
   outerH,
   outerRadius,
   thickness
) {
   context.save();

   // Clip the sparkles so they only appear on the guard frame.
   context.beginPath();

   context.roundRect(
      outerX,
      outerY,
      outerW,
      outerH,
      outerRadius
   );

   context.roundRect(
      outerX + thickness,
      outerY + thickness,
      outerW - thickness * 2,
      outerH - thickness * 2,
      Math.max(4, outerRadius - thickness)
   );

   context.clip('evenodd');

   // Seeded randomness prevents the sparkles from moving every render.
   const random = seededRandom(1847);

   const sparkleColors = [
      'rgba(32, 220, 255, 0.95)',
      'rgba(77, 240, 255, 0.85)',
      'rgba(185, 250, 255, 0.95)',
      'rgba(255, 255, 255, 0.85)'
   ];

   for (let i = 0; i < 12000; i++) {
      const x = outerX + random() * outerW;
      const y = outerY + random() * outerH;

      // Most flakes are very small.
      const radius =
         random() > 0.94
            ? 0.6 + random() * 0.5
            : 0.2 + random() * 0.2;

      const colorIndex = Math.floor(
         random() * sparkleColors.length
      );

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = sparkleColors[colorIndex];
      context.fill();

      // Occasional soft glow around larger flakes.
      if (radius > 1.4) {
         context.beginPath();
         context.arc(x, y, radius * 2.2, 0, Math.PI * 2);
         context.fillStyle = 'rgba(50, 210, 255, 0.12)';
         context.fill();
      }
   }

   context.restore();
}

function roundedRectPath(context, x, y, w, h, r) {
   const radius = Math.min(r, w / 2, h / 2);
   context.beginPath();
   context.moveTo(x + radius, y);
   context.arcTo(x + w, y, x + w, y + h, radius);
   context.arcTo(x + w, y + h, x, y + h, radius);
   context.arcTo(x, y + h, x, y, radius);
   context.arcTo(x, y, x + w, y, radius);
   context.closePath();
}

function shade(hex, amount) {
   const value = hex.replace('#', '');
   const num = parseInt(value, 16);
   const r = Math.max(0, Math.min(255, (num >> 16) + amount));
   const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amount));
   const b = Math.max(0, Math.min(255, (num & 255) + amount));
   return `rgb(${r}, ${g}, ${b})`;
}

function drawPlaceholder() {
   const grad = ctx.createLinearGradient(0, 105, 0, 900);
   const cardGrad = ctx.createLinearGradient(120, 300, 570, 880);

   cardGrad.addColorStop(0, '#243a73');
   cardGrad.addColorStop(.45, '#f3b236');
   cardGrad.addColorStop(1, '#74242a');
   ctx.fillStyle = cardGrad;
   roundedRectPath(ctx, 130, 305, 440, 560, 18);
   ctx.fill();

   ctx.fillStyle = 'rgba(255,255,255,.9)';
   ctx.textAlign = 'center';
   ctx.font = '800 38px Arial';
   ctx.fillText('UPLOAD YOUR', 350, 560);
   ctx.fillText('SLAB IMAGE', 350, 610);
}

function drawSlab() {
   if (!slabImage) {
      drawPlaceholder();
      return;
   }

   const baseX = 62;
   const baseY = 34;
   const baseW = 576;
   const baseH = 932;
   const scale = Number(zoom.value) / 100;

   const imageRatio = slabImage.naturalWidth / slabImage.naturalHeight;
   const boxRatio = baseW / baseH;
   let drawW;
   let drawH;

   // "Cover" behavior so the slab fills the guard opening.
   if (imageRatio > boxRatio) {
      drawH = baseH * scale;
      drawW = drawH * imageRatio;
   } else {
      drawW = baseW * scale;
      drawH = drawW / imageRatio;
   }

   const x = baseX + (baseW - drawW) / 2 + Number(offsetX.value);
   const y = baseY + (baseH - drawH) / 2 + Number(offsetY.value);

   ctx.save();
   roundedRectPath(ctx, baseX, baseY, baseW, baseH, 28);
   ctx.clip();
   ctx.drawImage(slabImage, x, y, drawW, drawH);
   ctx.restore();
}

function makeGuardLayer() {
   const layer = document.createElement('canvas');
   layer.width = canvas.width;
   layer.height = canvas.height;
   const g = layer.getContext('2d');

   const color = guardColor.value;
   const isStarlight = color.toUpperCase() === '#627B79';
   const isGalaxyBlue = color.toUpperCase() === '#4B4D8E';

   const thickness = 22;

   // Overall guard bounds.
   const outerX = 70;
   const outerY = 30;
   const outerW = 560;
   const outerH = 940;
   const outerRadius = 24;

   // Position of the horizontal separator between the label and card areas.
   const dividerY = 245;

   // Draw only the thin outside frame.
   g.lineWidth = thickness;
   g.lineJoin = 'round';

   if (isStarlight) {
      const gradient = g.createLinearGradient(
         outerX,
         outerY,
         outerX + outerW,
         outerY + outerH
      );

      gradient.addColorStop(0.35, '#1d5046');
      gradient.addColorStop(0.50, '#1b4e45');
      gradient.addColorStop(0.56, '#265a4d');
      gradient.addColorStop(0.64, '#17574b');
      gradient.addColorStop(0.82, '#225f55');

      g.strokeStyle = gradient;
   } else if (isGalaxyBlue) {
      const galaxyGradient = g.createLinearGradient(
         outerX,
         outerY,
         outerX + outerW,
         outerY + outerH
      );

      galaxyGradient.addColorStop(0.00, '#151936');
      galaxyGradient.addColorStop(0.25, '#161a3b');
      galaxyGradient.addColorStop(0.48, '#13142e');
      galaxyGradient.addColorStop(0.68, '#191c3b');
      galaxyGradient.addColorStop(1.00, '#11152f');

      g.strokeStyle = galaxyGradient;
   } else {
      g.strokeStyle = color;
   }

   roundedRectPath(
      g,
      outerX + thickness / 2,
      outerY + thickness / 2,
      outerW - thickness,
      outerH - thickness,
      outerRadius
   );

   g.stroke();

   // Add a subtle shimmer over the Starlight guard.
   if (isStarlight) {
      const shine = g.createLinearGradient(
         outerX,
         outerY,
         outerX + outerW,
         outerY + outerH
      );

      shine.addColorStop(0.50, 'rgba(95,255,210,.45)');

      g.save();

      g.lineWidth = thickness * 0.28;
      g.strokeStyle = shine;
      g.lineJoin = 'round';

      roundedRectPath(
         g,
         outerX + thickness / 2,
         outerY + thickness / 2,
         outerW - thickness,
         outerH - thickness,
         outerRadius
      );

      g.stroke();
      g.restore();
   }

   // Add very subtle highlights/shadows so it still looks dimensional,
   // without making the guard appear thick.
   g.lineWidth = 1;
   g.strokeStyle = 'rgba(255,255,255,.28)';

   roundedRectPath(
      g,
      outerX + thickness / 2 + 2,
      outerY + thickness / 2 + 2,
      outerW - thickness - 4,
      outerH - thickness - 4,
      Math.max(8, outerRadius - 2)
   );

   g.stroke();

   g.strokeStyle = 'rgba(0,0,0,.16)';

   roundedRectPath(
      g,
      outerX + thickness / 2 - 2,
      outerY + thickness / 2 - 2,
      outerW - thickness + 4,
      outerH - thickness + 4,
      outerRadius + 2
   );

   g.stroke();

   if (isGalaxyBlue) {
      drawGalaxySparkles(
         g,
         outerX,
         outerY,
         outerW,
         outerH,
         outerRadius,
         thickness
      );
   }

   return layer;
}

function makeDividerLayer() {
   const layer = document.createElement('canvas');
   const leftInset = 11;

   layer.width = canvas.width;
   layer.height = canvas.height;

   const g = layer.getContext('2d');

   const color = guardColor.value;
   const isStarlight = color.toUpperCase() === '#627B79';
   const isGalaxyBlue = color.toUpperCase() === '#4B4D8E';

   const thickness = 22;

   const outerX = 85;
   const outerW = 520;

   const dividerY = 245;
   const dividerThickness = 50;

   const dividerX =
      outerX + thickness / 2 + 10;

   const dividerTop =
      dividerY - dividerThickness / 2;

   const dividerWidth =
      outerW - thickness - leftInset;

   // Set the main divider color before drawing it.
   if (isStarlight) {
      const gradient = g.createLinearGradient(
         outerX,
         dividerY,
         outerX + outerW,
         dividerY
      );

      gradient.addColorStop(0.35, '#1d5046');
      gradient.addColorStop(0.50, '#1b4e45');
      gradient.addColorStop(0.56, '#265a4d');
      gradient.addColorStop(0.64, '#17574b');
      gradient.addColorStop(0.82, '#225f55');

      g.fillStyle = gradient;
   } else if (isGalaxyBlue) {
      const galaxyGradient = g.createLinearGradient(
         outerX,
         dividerY,
         outerX + outerW,
         dividerY
      );

      galaxyGradient.addColorStop(0.00, '#151936');
      galaxyGradient.addColorStop(0.25, '#161a3b');
      galaxyGradient.addColorStop(0.48, '#13142e');
      galaxyGradient.addColorStop(0.68, '#191c3b');
      galaxyGradient.addColorStop(1.00, '#11152f');

      g.fillStyle = galaxyGradient;
   } else {
      g.fillStyle = color;
   }

   roundedRectPath(
      g,
      dividerX,
      dividerTop,
      dividerWidth,
      dividerThickness,
      0
   );

   g.fill();

   // Add a subtle shimmer over the Starlight divider.
   if (isStarlight) {
      const shine = g.createLinearGradient(
         outerX,
         dividerY,
         outerX + outerW,
         dividerY
      );

      shine.addColorStop(0.00, 'rgba(0, 0, 0, 0)');
      shine.addColorStop(0.34, 'rgba(29, 118, 91, 0.04)');
      shine.addColorStop(0.46, 'rgba(57, 181, 138, 0.16)');
      shine.addColorStop(0.53, 'rgba(142, 235, 187, 0.30)');
      shine.addColorStop(0.58, 'rgba(202, 255, 222, 0.18)');
      shine.addColorStop(0.66, 'rgba(42, 143, 110, 0.12)');
      shine.addColorStop(1.00, 'rgba(0, 0, 0, 0)');

      g.save();
      g.fillStyle = shine;

      roundedRectPath(
         g,
         dividerX,
         dividerTop,
         dividerWidth,
         dividerThickness,
         0
      );

      g.fill();
      g.restore();
   }

   // Add Galaxy Blue sparkles over the divider.
   if (isGalaxyBlue) {
      drawGalaxySparklesInRect(
         g,
         dividerX,
         dividerTop,
         dividerWidth,
         dividerThickness,
         250,
         2841
      );
   }

   return layer;
}

function makeInnerEdgeLayer() {
   const layer = document.createElement('canvas');
   layer.width = canvas.width;
   layer.height = canvas.height;

   const g = layer.getContext('2d');

   const color = guardColor.value;
   const thickness = 25;

   const outerX = 70;
   const outerY = 30;
   const outerW = 560;
   const outerH = 940;
   const outerRadius = 5;

   // Width of the translucent area visible along the inside edge.
   const innerEdgeWidth = 16;

   const isStarlight = color.toUpperCase() === '#627B79';
   const isGalaxyBlue = color.toUpperCase() === '#4B4D8E';

   if (isStarlight) {
      const innerGradient = g.createLinearGradient(
         outerX,
         outerY,
         outerX + outerW,
         outerY + outerH
      );

      innerGradient.addColorStop(0.00, '#151A1C');
      innerGradient.addColorStop(0.34, '#16443F');
      innerGradient.addColorStop(0.52, '#49BDA8');
      innerGradient.addColorStop(0.66, '#278D7F');
      innerGradient.addColorStop(1.00, '#111719');

      g.strokeStyle = innerGradient;
   } else if (isGalaxyBlue) {
      const galaxyGradient = g.createLinearGradient(
         outerX,
         outerY,
         outerX + outerW,
         outerY + outerH
      );

      galaxyGradient.addColorStop(0.00, '#151936');
      galaxyGradient.addColorStop(0.25, '#161a3b');
      galaxyGradient.addColorStop(0.48, '#13142e');
      galaxyGradient.addColorStop(0.68, '#191c3b');
      galaxyGradient.addColorStop(1.00, '#11152f');

      g.strokeStyle = galaxyGradient;
   } else {
      g.strokeStyle = color;
   }
   g.lineWidth = innerEdgeWidth;
   g.lineJoin = 'round';

   const overlap = 4;

   roundedRectPath(
      g,
      outerX + thickness - overlap + innerEdgeWidth / 2,
      outerY + thickness - overlap + innerEdgeWidth / 2,
      outerW - ((thickness - overlap) * 2) - innerEdgeWidth,
      outerH - ((thickness - overlap) * 2) - innerEdgeWidth,
      Math.max(8, outerRadius - thickness / 2)
   );

   g.stroke();

   if (isGalaxyBlue) {
      drawGalaxySparkles(
         g,
         outerX + thickness - overlap,
         outerY + thickness - overlap,
         outerW - ((thickness - overlap) * 2),
         outerH - ((thickness - overlap) * 2),
         Math.max(4, outerRadius),
         innerEdgeWidth
      );
   }

   return layer;
}

function render() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   const drawW = canvas.width * 1.07;
   const drawH = canvas.height * 1.04;

   const drawX = (canvas.width - drawW) / 2;
   const drawY = (canvas.height - drawH) / 2;

   rebuildGuardLayersIfNeeded();

   // Physical pieces behind the slab.
   ctx.drawImage(
      cachedDividerLayer,
      drawX,
      drawY,
      drawW,
      drawH
   );

   ctx.drawImage(
      cachedInnerEdgeLayer,
      drawX,
      drawY,
      drawW,
      drawH
   );

   // Slab image is the only part affected by the sliders.
   drawSlab();

   // Simulate seeing the pieces through the clear slab.
   ctx.save();
   ctx.globalAlpha = 0.5;

   ctx.drawImage(
      cachedDividerLayer,
      drawX,
      drawY,
      drawW,
      drawH
   );

   ctx.drawImage(
      cachedInnerEdgeLayer,
      drawX,
      drawY,
      drawW,
      drawH
   );

   ctx.restore();

   // Solid outer guard stays in front.
   ctx.drawImage(
      cachedGuardLayer,
      drawX,
      drawY,
      drawW,
      drawH
   );
}

function loadFile(file) {
   if (!file || !file.type.startsWith('image/')) {
      alert('Please choose a PNG, JPG, or WEBP image.');
      return;
   }

   const reader = new FileReader();

   reader.onerror = () => {
      alert('The image could not be read. Please try another file.');
   };

   reader.onload = () => {
      const image = new Image();

      image.onerror = () => {
         alert('That image format could not be loaded.');
      };

      image.onload = () => {
         slabImage = image;
         render();
      };

      image.src = reader.result;
   };

   reader.readAsDataURL(file);
}

upload.addEventListener('change', event => {
   loadFile(event.target.files?.[0]);
});

canvas.addEventListener('dragover', event => {
   event.preventDefault();

   if (!slabImage)
      canvas.style.cursor = 'copy';
});

canvas.addEventListener('dragleave', () => {
   canvas.style.cursor = slabImage
      ? 'default'
      : 'pointer';
});

canvas.addEventListener('drop', event => {
   event.preventDefault();

   canvas.style.cursor = 'default';

   const file = event.dataTransfer.files?.[0];

   if (file)
      loadFile(file);
});

canvas.addEventListener('dragenter', event => {
   event.preventDefault();
   canvas.classList.add('drag-active');
});

canvas.addEventListener('dragleave', () => {
   canvas.classList.remove('drag-active');
});

canvas.addEventListener('drop', event => {
   event.preventDefault();

   canvas.classList.remove('drag-active');

   const file = event.dataTransfer.files?.[0];

   if (file)
      loadFile(file);
});

// guardColor.addEventListener('input', () => {
//    hexValue.textContent = guardColor.value.toUpperCase();

// document.documentElement.style.setProperty(
//    '--slab-preview-accent',
//    guardColor.value
// );

// const color = guardColor.value;

// const r = parseInt(color.slice(1, 3), 16);
// const g = parseInt(color.slice(3, 5), 16);
// const b = parseInt(color.slice(5, 7), 16);

// const brightness = (r * 299 + g * 587 + b * 114) / 1000;

// document.documentElement.style.setProperty(
//    '--slab-preview-button-text',
//    brightness > 186 ? '#000000' : '#ffffff'
// );

// document.querySelectorAll('.slab-preview-swatch').forEach(button => {
//    button.classList.toggle(
//       'active',
//       button.dataset.color.toLowerCase() ===
//       guardColor.value.toLowerCase()
//    );
// });

// render();
// });

canvas.addEventListener('click', event => {
   const rect = canvas.getBoundingClientRect();

   const scaleX = canvas.width / rect.width;
   const scaleY = canvas.height / rect.height;

   const x = (event.clientX - rect.left) * scaleX;
   const y = (event.clientY - rect.top) * scaleY;

   // Same approximate area as the placeholder card.
   const uploadArea = {
      x: 130,
      y: 305,
      width: 440,
      height: 560
   };

   const isInsideUploadArea =
      x >= uploadArea.x &&
      x <= uploadArea.x + uploadArea.width &&
      y >= uploadArea.y &&
      y <= uploadArea.y + uploadArea.height;

   if (isInsideUploadArea)
      upload.click();
});

canvas.addEventListener('mousemove', event => {
   if (slabImage) {
      canvas.style.cursor = 'default';
      return;
   }

   const rect = canvas.getBoundingClientRect();

   const scaleX = canvas.width / rect.width;
   const scaleY = canvas.height / rect.height;

   const x = (event.clientX - rect.left) * scaleX;
   const y = (event.clientY - rect.top) * scaleY;

   const isInsideUploadArea =
      x >= 130 &&
      x <= 570 &&
      y >= 305 &&
      y <= 865;

   canvas.style.cursor = isInsideUploadArea
      ? 'pointer'
      : 'default';
});

document
   .getElementById('swatches')
   .addEventListener('click', event => {

      const button = event.target.closest('.slab-preview-swatch');

      if (!button)
         return;

      guardColor.value = button.dataset.color;

      cachedGuardLayer = null;
      cachedDividerLayer = null;
      cachedInnerEdgeLayer = null;
      cachedGuardColor = null;

      hexValue.textContent = button.dataset.name;
      document.documentElement.style.setProperty(
         '--slab-preview-accent',
         guardColor.value
      );

      const color = guardColor.value;

      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      const brightness = (r * 299 + g * 587 + b * 114) / 1000;

      document.documentElement.style.setProperty(
         '--slab-preview-button-text',
         brightness > 186 ? '#000000' : '#ffffff'
      );

      document.querySelectorAll('.slab-preview-swatch').forEach(swatch =>
         swatch.classList.toggle(
            'active',
            swatch === button
         )
      );

      render();
   });

[zoom, offsetX, offsetY].forEach(input => {
   input.addEventListener('input', () => {
      zoomValue.textContent = `${zoom.value}%`;
      offsetXValue.textContent = offsetX.value;
      offsetYValue.textContent = offsetY.value;

      render();
   });
});

resetBtn.addEventListener('click', () => {
   zoom.value = 100;
   offsetX.value = 0;
   offsetY.value = 0;

   zoomValue.textContent = '100%';
   offsetXValue.textContent = '0';
   offsetYValue.textContent = '0';

   render();
});

downloadBtn.addEventListener('click', () => {
   render();

   const link = document.createElement('a');
   link.download = 'slab-guard-preview.png';
   link.href = canvas.toDataURL('image/png');
   link.click();
});

render();