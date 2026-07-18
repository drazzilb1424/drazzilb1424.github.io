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
   // grad.addColorStop(0, '#f7f8fa');
   // grad.addColorStop(1, '#d7dbe2');
   // ctx.fillStyle = grad;
   // roundedRectPath(ctx, 82, 52, 536, 896, 24);
   // ctx.fill();

   // ctx.fillStyle = '#e31d2b';
   // roundedRectPath(ctx, 100, 80, 500, 166, 10);
   // ctx.fill();

   // ctx.fillStyle = '#fff';
   // ctx.font = '700 48px Arial';
   // ctx.textAlign = 'left';
   // ctx.fillText('PSA', 128, 154);
   // ctx.font = '700 22px Arial';
   // ctx.fillText('GEM MINT 10', 128, 198);

   // ctx.fillStyle = '#f3f4f6';
   // roundedRectPath(ctx, 111, 280, 478, 610, 12);
   // ctx.fill();

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
   const isStarlight =
      color.toUpperCase() === '#627B79';

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

      // shine.addColorStop(0.00, 'rgba(0, 0, 0, 0)');
      // shine.addColorStop(0.32, 'rgba(35, 130, 116, 0.03)');
      // shine.addColorStop(0.40, 'rgba(42,170,140,.18)');
      shine.addColorStop(0.50, 'rgba(95,255,210,.45)');
      // shine.addColorStop(0.58, 'rgba(180,255,230,.28)');
      // shine.addColorStop(0.63, 'rgba(50, 180, 159, 0.15)');
      // shine.addColorStop(1.00, 'rgba(0, 0, 0, 0)');

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

   return layer;
}

function makeDividerLayer() {
   const layer = document.createElement('canvas');
   const leftInset = 11;

   layer.width = canvas.width;
   layer.height = canvas.height;

   const g = layer.getContext('2d');

   const color = guardColor.value;
   const isStarlight =
      color.toUpperCase() === '#627B79';

   const thickness = 22;

   const outerX = 85;
   const outerW = 520;

   const dividerY = 245;
   const dividerThickness = 50;

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
   } else {
      g.fillStyle = color;
   }

   roundedRectPath(
      g,
      outerX + thickness / 2 + 10,
      dividerY - dividerThickness / 2,
      outerW - thickness - leftInset,
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
         outerX + thickness / 2 + 10,
         dividerY - dividerThickness / 2,
         outerW - thickness - leftInset,
         dividerThickness,
         0
      );

      g.fill();
      g.restore();
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

   const isStarlight =
      color.toUpperCase() === '#627B79';

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

   return layer;
}

function render() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   const drawW = canvas.width * 1.07;
   const drawH = canvas.height * 1.04;

   const drawX = (canvas.width - drawW) / 2;
   const drawY = (canvas.height - drawH) / 2;

   const dividerLayer = makeDividerLayer();
   const innerEdgeLayer = makeInnerEdgeLayer();
   const guardLayer = makeGuardLayer();

   // Physical pieces behind the slab.
   ctx.drawImage(dividerLayer, drawX, drawY, drawW, drawH);
   ctx.drawImage(innerEdgeLayer, drawX, drawY, drawW, drawH);

   // Slab sits over them.
   drawSlab();

   // Simulate seeing the pieces through the clear plastic.
   ctx.save();
   ctx.globalAlpha = 0.5;

   ctx.drawImage(dividerLayer, drawX, drawY, drawW, drawH);
   ctx.drawImage(innerEdgeLayer, drawX, drawY, drawW, drawH);

   ctx.restore();

   // Solid outer guard stays in front.
   ctx.drawImage(guardLayer, drawX, drawY, drawW, drawH);
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
