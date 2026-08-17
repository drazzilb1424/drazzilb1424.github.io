let cachedGuardLayer = null;
let cachedDividerLayer = null;
let cachedInnerEdgeLayer = null;
let cachedGuardColor = null;

const renderOverlay = document.getElementById('renderOverlay');
const guardTouchArea = document.getElementById('guardTouchArea');

function showRenderSpinner() {
   renderOverlay?.classList.remove('hidden');
}

function hideRenderSpinner() {
   renderOverlay?.classList.add('hidden');
}

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

const upload = document.getElementById('slabUpload');

// const guardColor = document.getElementById('guardColor');
let guardColor = {
   value: '#627B79'
};
const hexValue = document.getElementById('hexValue');

let slabZoom = 1;
let slabOffsetX = 0;
let slabOffsetY = 0;

let isDraggingSlab = false;
let previousPointerX = 0;
let previousPointerY = 0;

const activePointers = new Map();

let previousPinchDistance = null;
let previousPinchCenter = null;

const downloadBtn = document.getElementById('downloadBtn');
const uploadNewBtn = document.getElementById('uploadNewBtn');

let slabImage = null;

const CELESTIAL_STYLES = {
   // BLUE
   '#20B9DC': {
      gradient: [
         '#159FC4',
         '#20B9DC',
         '#29C6E5',
         '#18AED3',
         '#25BEDF'
      ],
      sparkles: [
         'rgba(175,235,255,.95)',
         'rgba(205,245,255,.95)',
         'rgba(135,220,250,.90)',
         'rgba(235,250,255,.95)'
      ],
      glow: 'rgba(150,230,255,.16)'
   },

   // PURPLE
   '#9B78D0': {
      gradient: [
         '#7654B5',
         '#8B68C5',
         '#9B78D0',
         '#A98BDA',
         '#8763C2'
      ],
      sparkles: [
         'rgba(175,235,255,.95)',
         'rgba(205,245,255,.95)',
         'rgba(135,220,250,.90)',
         'rgba(235,250,255,.95)'
      ],
      glow: 'rgba(150,230,255,.16)'
   },

   // LIGHT PINK
   '#F0D6D9': {
      gradient: [
         '#E9A5C3',
         '#F0B2CD',
         '#F3B8D2',
         '#F7C5DB',
         '#ECAAC7'
      ],
      sparkles: [
         'rgba(255,255,255,.98)',
         'rgba(250,248,245,.95)',
         'rgba(242,240,238,.92)',
         'rgba(255,252,248,.96)'
      ],
      glow: 'rgba(255,255,255,.14)'
   },

   // YELLOW
   '#F4D96B': {
      gradient: [
         '#E8C84E',
         '#F1D45E',
         '#F4D96B',
         '#F8E27E',
         '#EBCB52'
      ],
      sparkles: [
         'rgba(255,215,90,.98)',
         'rgba(235,185,45,.95)',
         'rgba(255,230,125,.95)',
         'rgba(210,155,30,.92)'
      ],
      glow: 'rgba(255,205,70,.16)'
   },

   // WHITE
   '#F1F0EC': {
      gradient: [
         '#FFFFFF',
         '#F5F4F1',
         '#F1F0EC',
         '#FAFAF8',
         '#ECEBE8'
      ],
      sparkles: [
         'rgba(190,245,255,.95)',  // icy blue
         'rgba(225,205,255,.95)',  // lavender
         'rgba(255,210,235,.95)',  // pink
         'rgba(255,255,255,.98)'   // bright white
      ],
      glow: 'rgba(220,235,255,.16)'
   }

};

const GALAXY_STYLES = {
   // DARK BLUE
   '#4B4D8E': {
      gradient: ['#151936', '#161a3b', '#13142e', '#191c3b', '#11152f'],
      sparkles: [
         'rgba(32,220,255,.95)',
         'rgba(77,240,255,.85)',
         'rgba(185,250,255,.95)',
         'rgba(255,255,255,.85)'
      ],
      glow: 'rgba(50,210,255,.12)'
   },

   // DARK GREEN
   '#174A36': {
      gradient: ['#0b241b', '#123c2c', '#0d3023', '#174a36', '#091f17'],
      sparkles: [
         'rgba(235,235,235,.95)',
         'rgba(210,210,210,.90)',
         'rgba(70,220,120,.90)',
         'rgba(150,255,190,.85)'
      ],
      glow: 'rgba(70,220,120,.12)'
   },

   // BLACK
   '#17191C': {
      gradient: ['#090909', '#1a1a1a', '#101010', '#232323', '#080808'],
      sparkles: [
         'rgba(255,255,255,.92)',
         'rgba(225,225,225,.90)',
         'rgba(195,195,195,.85)',
         'rgba(240,240,240,.82)'
      ],
      glow: 'rgba(255,255,255,.08)'
   },

   // RED
   '#7A2028': {
      gradient: ['#be3243', '#c4293b', '#cc2b38', '#b81f31', '#be2a40'],
      sparkles: [
         'rgba(255,255,255,.92)',
         'rgba(230,230,230,.90)',
         'rgba(205,205,205,.88)',
         'rgba(240,240,240,.85)'
      ],
      glow: 'rgba(255,255,255,.08)'
   },

   // SILVER
   '#5B6068': {
      gradient: ['#36393e', '#555b63', '#666b73', '#4c5057', '#2d3035'],
      sparkles: [
         'rgba(255,255,255,.92)',
         'rgba(235,235,235,.90)',
         'rgba(210,210,210,.88)',
         'rgba(245,245,245,.84)'
      ],
      glow: 'rgba(255,255,255,.08)'
   }
};

function getGalaxyStyle(color) {
   return GALAXY_STYLES[color.toUpperCase()] ?? null;
}

function getCelestialStyle(color) {
   return CELESTIAL_STYLES[color.toUpperCase()] ?? null;
}

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

function drawSparklePattern(
   context,
   x,
   y,
   width,
   height,
   sparkleColors,
   count = 500,
   seed = 2841
) {
   context.save();

   context.beginPath();
   context.rect(x, y, width, height);
   context.clip();

   const random = seededRandom(seed);

   for (let i = 0; i < count; i++) {
      const sparkleX = x + random() * width;
      const sparkleY = y + random() * height;

      const sizeRandom = random();

      let radius;

      if (sizeRandom < 0.45) {
         radius = 0.20;
      } else if (sizeRandom < 0.75) {
         radius = 0.35;
      } else if (sizeRandom < 0.93) {
         radius = 0.55;
      } else {
         radius = 0.75;
      }

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


function createSparklePattern(sparkleColors, glowColor) {
   const tile = document.createElement('canvas');

   tile.width = 80;
   tile.height = 80;

   const g = tile.getContext('2d');

   const flakes = [
      { x: 12, y: 14, c: 0 },
      { x: 34, y: 9, c: 1 },
      { x: 62, y: 18, c: 2 },
      { x: 21, y: 39, c: 3 },
      { x: 52, y: 45, c: 0 },
      { x: 72, y: 58, c: 1 },
      { x: 15, y: 67, c: 2 },
      { x: 43, y: 72, c: 3 },

      { x: 26, y: 25, c: 0 },
      { x: 48, y: 31, c: 2 },
      { x: 68, y: 38, c: 1 },
      { x: 31, y: 57, c: 3 },
      { x: 60, y: 68, c: 0 },

      { x: 8, y: 30, c: 1 },
      { x: 44, y: 16, c: 3 },
      { x: 75, y: 8, c: 0 },
      { x: 57, y: 27, c: 1 },
      { x: 38, y: 42, c: 2 },
      { x: 76, y: 48, c: 3 },
      { x: 7, y: 51, c: 0 },
      { x: 23, y: 75, c: 1 },
      { x: 50, y: 59, c: 2 },
      { x: 69, y: 76, c: 3 },
      { x: 5, y: 6, c: 2 },
      { x: 39, y: 64, c: 0 },

      { x: 19, y: 6, c: 3 },
      { x: 51, y: 7, c: 2 },
      { x: 71, y: 25, c: 0 },
      { x: 16, y: 22, c: 1 },
      { x: 37, y: 29, c: 3 },
      { x: 59, y: 37, c: 2 },
      { x: 13, y: 45, c: 0 },
      { x: 29, y: 48, c: 2 },
      { x: 45, y: 52, c: 1 },
      { x: 64, y: 53, c: 3 },
      { x: 9, y: 60, c: 1 },
      { x: 27, y: 65, c: 0 },
      { x: 55, y: 75, c: 3 },
      { x: 75, y: 69, c: 2 },
      { x: 35, y: 20, c: 1 },

      { x: 8, y: 17, c: 0 },
      { x: 27, y: 11, c: 2 },
      { x: 42, y: 5, c: 1 },
      { x: 58, y: 10, c: 3 },
      { x: 69, y: 13, c: 0 },

      { x: 5, y: 24, c: 2 },
      { x: 22, y: 18, c: 3 },
      { x: 41, y: 23, c: 0 },
      { x: 53, y: 20, c: 1 },
      { x: 77, y: 30, c: 2 },

      { x: 14, y: 34, c: 3 },
      { x: 30, y: 34, c: 0 },
      { x: 44, y: 37, c: 1 },
      { x: 55, y: 33, c: 2 },
      { x: 73, y: 42, c: 3 },

      { x: 4, y: 40, c: 1 },
      { x: 18, y: 49, c: 2 },
      { x: 35, y: 52, c: 3 },
      { x: 49, y: 40, c: 0 },
      { x: 63, y: 44, c: 1 },

      { x: 10, y: 56, c: 2 },
      { x: 24, y: 54, c: 0 },
      { x: 40, y: 58, c: 1 },
      { x: 57, y: 55, c: 3 },
      { x: 70, y: 51, c: 2 },

      { x: 5, y: 71, c: 3 },
      { x: 19, y: 61, c: 1 },
      { x: 34, y: 69, c: 2 },
      { x: 47, y: 66, c: 0 },
      { x: 64, y: 62, c: 3 },

      { x: 76, y: 63, c: 0 },
      { x: 11, y: 77, c: 2 },
      { x: 29, y: 78, c: 3 },
      { x: 46, y: 77, c: 1 },
      { x: 63, y: 79, c: 0 },
      { x: 77, y: 78, c: 2 },

      { x: 32, y: 3, c: 0 },
      { x: 65, y: 5, c: 1 },
      { x: 3, y: 63, c: 3 },
      { x: 78, y: 19, c: 1 }
   ];

   flakes.forEach(flake => {
      const color =
         sparkleColors[
         flake.c % sparkleColors.length
         ];


      // --------------------------------
      // REPEATABLE RANDOM SIZE
      // --------------------------------

      const sizeRandom =
         Math.abs(
            Math.sin(
               flake.x * 12.9898 +
               flake.y * 78.233
            )
         ) % 1;

      let radius;

      if (sizeRandom < 0.45) {
         radius = 0.25;
      } else if (sizeRandom < 0.75) {
         radius = 0.50;
      } else if (sizeRandom < 0.93) {
         radius = 0.80;
      } else {
         radius = 1.10;
      }

      if (sizeRandom < 0.45) {
         radius = 0.20;
      } else if (sizeRandom < 0.75) {
         radius = 0.35;
      } else if (sizeRandom < 0.93) {
         radius = 0.50;
      } else {
         radius = 0.75;
      }


      // --------------------------------
      // RANDOM SHINE
      // --------------------------------
      //
      // This uses different numbers than
      // the size calculation so shine isn't
      // tied to flake size.
      // --------------------------------

      const shineRandom =
         Math.abs(
            Math.sin(
               flake.x * 37.719 +
               flake.y * 93.127 +
               17.531
            )
         ) % 1;


      // Most flakes are normal.
      let brightness = 0.60;
      let glowStrength = 0;
      let glowSize = 1;

      // About 25% are brighter
      if (shineRandom >= 0.75) {
         brightness = 0.85;

         radius *= 1.05;

         glowStrength = 0.35;
         glowSize = 1.7;
      }

      // About 10% are very shiny
      if (shineRandom >= 0.90) {
         brightness = 1.0;

         radius *= 1.05;

         glowStrength = 0.65;
         glowSize = 2.0;
      }

      // About 3% are extra reflective
      const isHotSparkle =
         shineRandom >= 0.97;

      if (isHotSparkle) {
         brightness = 1.0;

         radius *= 1.05;

         glowStrength = 0.90;
         glowSize = 2.4;
      }


      // --------------------------------
      // OUTER GLOW
      // --------------------------------

      if (glowStrength > 0) {
         g.save();

         g.globalAlpha = glowStrength;

         g.beginPath();

         g.arc(
            flake.x,
            flake.y,
            radius * glowSize,
            0,
            Math.PI * 2
         );

         g.fillStyle = glowColor;
         g.fill();

         g.restore();
      }


      // --------------------------------
      // ACTUAL FLAKE
      // --------------------------------

      g.save();

      g.globalAlpha = brightness;

      g.beginPath();

      g.arc(
         flake.x,
         flake.y,
         radius,
         0,
         Math.PI * 2
      );

      g.fillStyle = color;
      g.fill();

      g.restore();


      // --------------------------------
      // BRIGHT REFLECTION
      // --------------------------------

      if (shineRandom >= 0.90) {
         g.save();

         g.globalAlpha =
            isHotSparkle
               ? 1.0
               : 0.80;

         g.beginPath();

         g.arc(
            flake.x - radius * 0.18,
            flake.y - radius * 0.18,
            Math.max(
               0.15,
               radius * 0.32
            ),
            0,
            Math.PI * 2
         );

         g.fillStyle =
            'rgba(255,255,255,1)';

         g.fill();

         g.restore();
      }


      // --------------------------------
      // RARE STAR-LIKE GLINT
      // --------------------------------

      if (isHotSparkle) {
         g.save();

         g.globalAlpha = 0.90;

         g.strokeStyle =
            'rgba(255,255,255,1)';

         g.lineWidth = 0.25;

         const glintSize =
            Math.max(
               1.2,
               radius * 1.8
            );

         g.beginPath();

         // Horizontal shine
         g.moveTo(
            flake.x - glintSize,
            flake.y
         );

         g.lineTo(
            flake.x + glintSize,
            flake.y
         );

         // Vertical shine
         g.moveTo(
            flake.x,
            flake.y - glintSize
         );

         g.lineTo(
            flake.x,
            flake.y + glintSize
         );

         g.stroke();

         g.restore();
      }
   });

   return tile;
}

function drawFrameSparkles(
   context,
   outerX,
   outerY,
   outerW,
   outerH,
   outerRadius,
   thickness,
   sparkleColors,
   glowColor
) {
   context.save();

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

   const sparkleTile = createSparklePattern(
      sparkleColors,
      glowColor
   );

   const pattern = context.createPattern(
      sparkleTile,
      'repeat'
   );

   context.fillStyle = pattern;

   context.fillRect(
      outerX,
      outerY,
      outerW,
      outerH
   );

   context.restore();
}

function drawSparklesInRect(
   context,
   x,
   y,
   width,
   height,
   count,
   seed,
   sparkleColors
) {
   context.save();

   context.beginPath();
   context.rect(x, y, width, height);
   context.clip();

   const random = seededRandom(seed);

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
   thickness,
   sparkleColors,
   glowColor
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

   for (let i = 0; i < 12000; i++) {
      const x = outerX + random() * outerW;
      const y = outerY + random() * outerH;

      // Most flakes are very small.
      const radius =
         random() > 0.97
            ? 0.75 + random() * 0.65
            : 0.25 + random() * 0.23;

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
         context.fillStyle = glowColor;
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
   ctx.fillText('CLICK UPLOAD', 350, 560);
   ctx.fillText('BUTTON TO BEGIN', 350, 610);
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
   const scale = slabZoom;

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

   const x = baseX + (baseW - drawW) / 2 + slabOffsetX;
   const y = baseY + (baseH - drawH) / 2 + slabOffsetY;

   ctx.save();
   roundedRectPath(ctx, baseX, baseY, baseW, baseH, 28);
   ctx.clip();
   ctx.drawImage(slabImage, x, y, drawW, drawH);
   ctx.restore();
}


function isPointerInsideSlab(position) {
   const baseX = 62;
   const baseY = 34;
   const baseW = 576;
   const baseH = 932;

   return (
      position.x >= baseX &&
      position.x <= baseX + baseW &&
      position.y >= baseY &&
      position.y <= baseY + baseH
   );
}

function makeGuardLayer() {
   const layer = document.createElement('canvas');

   layer.width = canvas.width;
   layer.height = canvas.height;

   const g = layer.getContext('2d');

   const color = guardColor.value;

   const isStarlight =
      color.toUpperCase() === '#627B79';

   const galaxyStyle =
      getGalaxyStyle(color);

   const isGalaxy =
      galaxyStyle !== null;

   const celestialStyle =
      getCelestialStyle(color);

   const isCelestial =
      celestialStyle !== null;

   const thickness = 22;

   const outerX = 70;
   const outerY = 30;
   const outerW = 560;
   const outerH = 940;
   const outerRadius = 24;


   // ------------------------------
   // BASE COLOR / GRADIENT
   // ------------------------------

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

   } else if (isGalaxy || isCelestial) {
      const style = isGalaxy
         ? galaxyStyle
         : celestialStyle;

      const sparkleGradient = g.createLinearGradient(
         outerX,
         outerY,
         outerX + outerW,
         outerY + outerH
      );

      style.gradient.forEach((gradientColor, index) => {
         sparkleGradient.addColorStop(
            index / (style.gradient.length - 1),
            gradientColor
         );
      });

      g.strokeStyle = sparkleGradient;

   } else {
      g.strokeStyle = color;
   }


   // ------------------------------
   // DRAW OUTER FRAME
   // ------------------------------

   roundedRectPath(
      g,
      outerX + thickness / 2,
      outerY + thickness / 2,
      outerW - thickness,
      outerH - thickness,
      outerRadius
   );

   g.stroke();


   // ------------------------------
   // STARLIGHT SHIMMER
   // ------------------------------

   if (isStarlight) {
      const shine = g.createLinearGradient(
         outerX,
         outerY,
         outerX + outerW,
         outerY + outerH
      );

      shine.addColorStop(
         0.50,
         'rgba(95,255,210,.45)'
      );

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


   // ------------------------------
   // SUBTLE DIMENSION
   // ------------------------------

   g.lineWidth = 1;

   g.strokeStyle =
      'rgba(255,255,255,.28)';

   roundedRectPath(
      g,
      outerX + thickness / 2 + 2,
      outerY + thickness / 2 + 2,
      outerW - thickness - 4,
      outerH - thickness - 4,
      Math.max(8, outerRadius - 2)
   );

   g.stroke();


   g.strokeStyle =
      'rgba(0,0,0,.16)';

   roundedRectPath(
      g,
      outerX + thickness / 2 - 2,
      outerY + thickness / 2 - 2,
      outerW - thickness + 4,
      outerH - thickness + 4,
      outerRadius + 2
   );

   g.stroke();


   // ------------------------------
   // GALAXY / CELESTIAL SPARKLES
   // ------------------------------

   if (isGalaxy || isCelestial) {
      const style = isGalaxy
         ? galaxyStyle
         : celestialStyle;

      drawFrameSparkles(
         g,
         outerX,
         outerY,
         outerW,
         outerH,
         outerRadius,
         thickness,
         style.sparkles,
         style.glow
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

   const galaxyStyle = getGalaxyStyle(color);
   const isGalaxy = galaxyStyle !== null;

   const celestialStyle = getCelestialStyle(color);
   const isCelestial = celestialStyle !== null;

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


   // ------------------------------
   // BASE COLOR / GRADIENT
   // ------------------------------

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

   } else if (isGalaxy || isCelestial) {
      const style = isGalaxy
         ? galaxyStyle
         : celestialStyle;

      const sparkleGradient = g.createLinearGradient(
         outerX,
         dividerY,
         outerX + outerW,
         dividerY
      );

      style.gradient.forEach((gradientColor, index) => {
         sparkleGradient.addColorStop(
            index / (style.gradient.length - 1),
            gradientColor
         );
      });

      g.fillStyle = sparkleGradient;

   } else {
      g.fillStyle = color;
   }


   // ------------------------------
   // DRAW DIVIDER
   // ------------------------------

   roundedRectPath(
      g,
      dividerX,
      dividerTop,
      dividerWidth,
      dividerThickness,
      0
   );

   g.fill();


   // ------------------------------
   // STARLIGHT SHIMMER
   // ------------------------------

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


   // ------------------------------
   // GALAXY / CELESTIAL SPARKLES
   // ------------------------------

   if (isGalaxy || isCelestial) {
      const style = isGalaxy
         ? galaxyStyle
         : celestialStyle;

      g.save();

      // Keep the sparkle texture clipped inside the divider only.
      g.beginPath();
      g.rect(
         dividerX,
         dividerTop,
         dividerWidth,
         dividerThickness
      );
      g.clip();

      const sparkleTile = createSparklePattern(
         style.sparkles,
         style.glow
      );

      const pattern = g.createPattern(
         sparkleTile,
         'repeat'
      );

      g.fillStyle = pattern;

      g.fillRect(
         dividerX,
         dividerTop,
         dividerWidth,
         dividerThickness
      );

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

   const innerEdgeWidth = 16;

   const isStarlight =
      color.toUpperCase() === '#627B79';

   const galaxyStyle =
      getGalaxyStyle(color);

   const isGalaxy =
      galaxyStyle !== null;

   const celestialStyle =
      getCelestialStyle(color);

   const isCelestial =
      celestialStyle !== null;


   // ------------------------------
   // BASE COLOR / GRADIENT
   // ------------------------------

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

   } else if (isGalaxy || isCelestial) {
      const style = isGalaxy
         ? galaxyStyle
         : celestialStyle;

      const sparkleGradient = g.createLinearGradient(
         outerX,
         outerY,
         outerX + outerW,
         outerY + outerH
      );

      style.gradient.forEach((gradientColor, index) => {
         sparkleGradient.addColorStop(
            index / (style.gradient.length - 1),
            gradientColor
         );
      });

      g.strokeStyle = sparkleGradient;

   } else {
      g.strokeStyle = color;
   }


   // ------------------------------
   // DRAW INNER EDGE
   // ------------------------------

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


   // ------------------------------
   // GALAXY / CELESTIAL SPARKLES
   // ------------------------------

   if (isGalaxy || isCelestial) {
      const style = isGalaxy
         ? galaxyStyle
         : celestialStyle;

      drawFrameSparkles(
         g,
         outerX + thickness - overlap,
         outerY + thickness - overlap,
         outerW - ((thickness - overlap) * 2),
         outerH - ((thickness - overlap) * 2),
         Math.max(4, outerRadius),
         innerEdgeWidth,
         style.sparkles,
         style.glow
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

   // Back accent strip
   ctx.globalAlpha = 0.4;
   ctx.drawImage(
      cachedDividerLayer,
      drawX,
      drawY,
      drawW,
      drawH
   );

   // Inner edge stays lighter
   ctx.globalAlpha = 0.4;
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

         slabZoom = 1;
         slabOffsetX = 0;
         slabOffsetY = 0;

         activePointers.clear();

         previousPinchDistance = null;
         previousPinchCenter = null;

         canvas.style.cursor = 'grab';

         render();
      };

      image.src = reader.result;
   };

   reader.readAsDataURL(file);
}

function getCanvasPointerPosition(event) {
   const rect = canvas.getBoundingClientRect();

   return {
      x:
         (event.clientX - rect.left) *
         (canvas.width / rect.width),

      y:
         (event.clientY - rect.top) *
         (canvas.height / rect.height)
   };
}

function getPinchData() {
   const points = Array.from(activePointers.values());

   if (points.length < 2)
      return null;

   const first = points[0];
   const second = points[1];

   const deltaX = second.x - first.x;
   const deltaY = second.y - first.y;

   return {
      distance: Math.hypot(deltaX, deltaY),

      center: {
         x: (first.x + second.x) / 2,
         y: (first.y + second.y) / 2
      }
   };
}

uploadNewBtn.addEventListener('click', () => {
   upload.click();
});

upload.addEventListener('change', event => {
   loadFile(event.target.files?.[0]);
});


canvas.addEventListener('wheel', event => {
   if (!slabImage)
      return;

   event.preventDefault();

   const zoomAmount = 0.08;

   if (event.deltaY < 0) {
      // Zoom in
      slabZoom += zoomAmount;
   } else {
      // Zoom out
      slabZoom -= zoomAmount;
   }

   slabZoom = Math.max(0.75, Math.min(2.5, slabZoom));

   render();
}, { passive: false });

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

canvas.addEventListener('mousemove', event => {
   if (isDraggingSlab) {
      canvas.style.cursor = 'grabbing';
      return;
   }

   const position = getCanvasPointerPosition(event);

   if (slabImage) {
      canvas.style.cursor =
         isPointerInsideSlab(position)
            ? 'grab'
            : 'default';
   } else {
      canvas.style.cursor = 'default';
   }
});

guardTouchArea.addEventListener('pointerdown', event => {
   if (!slabImage)
      return;

   const position = getCanvasPointerPosition(event);

   activePointers.set(event.pointerId, position);
   guardTouchArea.setPointerCapture(event.pointerId);

   if (activePointers.size === 1) {
      isDraggingSlab = true;
      previousPointerX = position.x;
      previousPointerY = position.y;

      guardTouchArea.style.cursor = 'grabbing';
   }

   if (activePointers.size === 2) {
      isDraggingSlab = false;

      const pinch = getPinchData();

      previousPinchDistance = pinch?.distance ?? null;
      previousPinchCenter = pinch?.center ?? null;
   }

   event.preventDefault();
});

guardTouchArea.addEventListener('pointermove', event => {
   if (!activePointers.has(event.pointerId))
      return;

   const position = getCanvasPointerPosition(event);

   activePointers.set(event.pointerId, position);

   if (activePointers.size === 1 && isDraggingSlab) {
      const deltaX = position.x - previousPointerX;
      const deltaY = position.y - previousPointerY;

      slabOffsetX += deltaX;
      slabOffsetY += deltaY;

      previousPointerX = position.x;
      previousPointerY = position.y;

      render();
   }

   if (activePointers.size === 2) {
      const pinch = getPinchData();

      if (
         !pinch ||
         previousPinchDistance === null ||
         previousPinchCenter === null
      ) {
         previousPinchDistance = pinch?.distance ?? null;
         previousPinchCenter = pinch?.center ?? null;
         return;
      }

      const oldZoom = slabZoom;

      const scaleChange =
         pinch.distance / previousPinchDistance;

      slabZoom *= scaleChange;
      slabZoom = Math.max(0.75, Math.min(2.5, slabZoom));

      const actualScaleChange = slabZoom / oldZoom;

      slabOffsetX =
         pinch.center.x -
         (pinch.center.x - slabOffsetX) * actualScaleChange;

      slabOffsetY =
         pinch.center.y -
         (pinch.center.y - slabOffsetY) * actualScaleChange;

      slabOffsetX +=
         pinch.center.x - previousPinchCenter.x;

      slabOffsetY +=
         pinch.center.y - previousPinchCenter.y;

      previousPinchDistance = pinch.distance;
      previousPinchCenter = pinch.center;

      render();
   }

   event.preventDefault();
});

function removeActivePointer(event) {
   activePointers.delete(event.pointerId);

   if (guardTouchArea.hasPointerCapture(event.pointerId)) {
      guardTouchArea.releasePointerCapture(event.pointerId);
   }

   if (activePointers.size === 1) {
      const remainingPoint =
         Array.from(activePointers.values())[0];

      isDraggingSlab = true;
      previousPointerX = remainingPoint.x;
      previousPointerY = remainingPoint.y;

      previousPinchDistance = null;
      previousPinchCenter = null;

      guardTouchArea.style.cursor = 'grabbing';
   } else {
      isDraggingSlab = false;

      previousPinchDistance = null;
      previousPinchCenter = null;

      guardTouchArea.style.cursor =
         slabImage ? 'grab' : 'default';
   }
}

guardTouchArea.addEventListener('lostpointercapture', event => {
   activePointers.delete(event.pointerId);

   if (activePointers.size === 0) {
      isDraggingSlab = false;
      previousPinchDistance = null;
      previousPinchCenter = null;

      guardTouchArea.style.cursor =
         slabImage ? 'grab' : 'default';
   }
});

guardTouchArea.addEventListener('pointerup', removeActivePointer);
guardTouchArea.addEventListener('pointercancel', removeActivePointer);

document
   .getElementById('swatches')
   .addEventListener('click', event => {

      const button = event.target.closest('.slab-preview-swatch');

      if (!button)
         return;

      guardColor.value = button.dataset.color;
      selectedGuardName = button.dataset.name;

      cachedGuardLayer = null;
      cachedDividerLayer = null;
      cachedInnerEdgeLayer = null;
      cachedGuardColor = null;

      hexValue.textContent = button.dataset.name;
      updateCheckoutSummary();
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

      const isSparkleSelection =
         getGalaxyStyle(guardColor.value) !== null ||
         getCelestialStyle(guardColor.value) !== null;

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

// ------------------------------
// SLAB GUARD CART + SQUARE CHECKOUT
// ------------------------------

const CART_STORAGE_KEY = 'crackedIceSlabGuardCartV1';
const CHECKOUT_ENDPOINT = window.CRACKED_ICE_CHECKOUT_API_URL;

if (!CHECKOUT_ENDPOINT) {
   console.warn('CRACKED_ICE_CHECKOUT_API_URL has not been configured.');
}

const CHECKOUT_PRICES = {
   solo: 3,
   galaxy: 3,
   celestial: 3,
   customText: 1
};

const checkoutColor = document.getElementById('checkoutColor');
const checkoutStyleBadge = document.getElementById('checkoutStyleBadge');
const checkoutUnitPrice = document.getElementById('checkoutUnitPrice');
const checkoutTotal = document.getElementById('checkoutTotal');
const guardQuantity = document.getElementById('guardQuantity');
const customTextEnabled = document.getElementById('customTextEnabled');
const customTextField = document.getElementById('customTextField');
const customText = document.getElementById('customText');
const addToCartBtn = document.getElementById('addToCartBtn');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartCount = document.getElementById('cartCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
const cartStatus = document.getElementById('cartStatus');

let selectedGuardName = 'Starlight';
let cart = loadCart();

function getSelectedGuardStyle() {
   const color = guardColor.value.toUpperCase();
   const isGalaxy = getGalaxyStyle(color) !== null;
   const isCelestial = getCelestialStyle(color) !== null;
   const isStarlight = color === '#627B79';

   if (isCelestial)
      return 'celestial';

   if (isGalaxy || isStarlight)
      return 'galaxy';

   return 'solo';
}

function getCheckoutQuantity() {
   const quantity = Number.parseInt(guardQuantity.value, 10);
   return Number.isFinite(quantity) ? Math.min(50, Math.max(1, quantity)) : 1;
}

function getConfiguredUnitPrice(style, hasCustomText) {
   return CHECKOUT_PRICES[style] + (hasCustomText ? CHECKOUT_PRICES.customText : 0);
}

function formatMoney(amount) {
   return `$${amount.toFixed(2)}`;
}

function updateCheckoutSummary() {
   const style = getSelectedGuardStyle();
   const quantity = getCheckoutQuantity();
   const hasCustomText = customTextEnabled.checked;
   const unitPrice = getConfiguredUnitPrice(style, hasCustomText);

   guardQuantity.value = quantity;
   checkoutColor.textContent = selectedGuardName;
   checkoutStyleBadge.textContent =
      style === 'galaxy'
         ? 'Galaxy'
         : style === 'celestial'
            ? 'Celestial'
            : 'Solo';
   checkoutUnitPrice.textContent = formatMoney(unitPrice);
   checkoutTotal.textContent = formatMoney(unitPrice * quantity);
   customTextField.classList.toggle('hidden', !hasCustomText);
   customText.required = hasCustomText;
}

function loadCart() {
   try {
      const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
      return Array.isArray(savedCart) ? savedCart : [];
   } catch (error) {
      console.warn('The saved cart could not be loaded.', error);
      return [];
   }
}

function saveCart() {
   localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function createCartKey(item) {
   return [
      item.style,
      item.colorHex.toUpperCase(),
      item.customText.trim().toLowerCase()
   ].join('|');
}

function addCurrentSelectionToCart() {
   const hasCustomText = customTextEnabled.checked;
   const enteredCustomText = customText.value.trim();

   if (hasCustomText && !enteredCustomText) {
      customText.setCustomValidity('Enter the custom text you want printed on the guard.');
      customText.reportValidity();
      return;
   }

   customText.setCustomValidity('');

   const item = {
      id: crypto.randomUUID(),
      style: getSelectedGuardStyle(),
      colorName: selectedGuardName,
      colorHex: guardColor.value.toUpperCase(),
      quantity: getCheckoutQuantity(),
      customText: hasCustomText ? enteredCustomText : ''
   };

   const key = createCartKey(item);
   const existingItem = cart.find(cartItem => createCartKey(cartItem) === key);

   if (existingItem) {
      existingItem.quantity = Math.min(50, existingItem.quantity + item.quantity);
   } else {
      cart.push(item);
   }

   saveCart();
   renderCart();
   showCartStatus(`${item.colorName} guard added to your cart.`, false);
}

function updateCartItemQuantity(itemId, quantity) {
   const item = cart.find(cartItem => cartItem.id === itemId);

   if (!item)
      return;

   item.quantity = Math.min(50, Math.max(1, quantity));
   saveCart();
   renderCart();
}

function removeCartItem(itemId) {
   cart = cart.filter(item => item.id !== itemId);
   saveCart();
   renderCart();
}

function getCartSubtotal() {
   return cart.reduce((total, item) => {
      const unitPrice = getConfiguredUnitPrice(item.style, Boolean(item.customText));
      return total + unitPrice * item.quantity;
   }, 0);
}

function renderCart() {
   cartItems.replaceChildren();

   const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
   cartCount.textContent = String(totalQuantity);
   cartSubtotal.textContent = formatMoney(getCartSubtotal());
   cartEmpty.classList.toggle('hidden', cart.length > 0);
   cartCheckoutBtn.disabled = cart.length === 0;

   cart.forEach(item => {
      const unitPrice = getConfiguredUnitPrice(item.style, Boolean(item.customText));
      const row = document.createElement('div');
      row.className = 'slab-cart-item';

      const details = document.createElement('div');
      details.className = 'slab-cart-item-details';

      const title = document.createElement('strong');
      const styleName =
         item.style === 'galaxy'
            ? 'Galaxy'
            : item.style === 'celestial'
               ? 'Celestial'
               : 'Solo';

      title.textContent = `${item.colorName} · ${styleName}`;

      const note = document.createElement('span');
      note.textContent = item.customText
         ? `Custom text: ${item.customText}`
         : 'No custom text';

      const price = document.createElement('span');
      price.textContent = `${formatMoney(unitPrice)} each`;

      details.append(title, note, price);

      const controls = document.createElement('div');
      controls.className = 'slab-cart-item-controls';

      const quantityInput = document.createElement('input');
      quantityInput.type = 'number';
      quantityInput.min = '1';
      quantityInput.max = '50';
      quantityInput.value = String(item.quantity);
      quantityInput.setAttribute('aria-label', `Quantity for ${item.colorName}`);
      quantityInput.addEventListener('change', () => {
         const quantity = Number.parseInt(quantityInput.value, 10);
         updateCartItemQuantity(item.id, Number.isFinite(quantity) ? quantity : 1);
      });

      const lineTotal = document.createElement('strong');
      lineTotal.textContent = formatMoney(unitPrice * item.quantity);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'slab-cart-remove';
      removeButton.setAttribute('aria-label', `Remove ${item.colorName} from cart`);
      removeButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
      removeButton.addEventListener('click', () => removeCartItem(item.id));

      controls.append(quantityInput, lineTotal, removeButton);
      row.append(details, controls);
      cartItems.append(row);
   });
}

function showCartStatus(message, isError) {
   cartStatus.textContent = message;
   cartStatus.classList.remove('hidden', 'error');
   cartStatus.classList.toggle('error', isError);
}

async function beginSquareCheckout() {
   if (cart.length === 0)
      return;

   if (!CHECKOUT_ENDPOINT) {
      showCartStatus(
         'The checkout service has not been configured yet.',
         true
      );
      return;
   }

   cartCheckoutBtn.disabled = true;
   cartCheckoutBtn.classList.add('loading');

   showCartStatus(
      'Creating your secure Square checkout...',
      false
   );

   try {
      const response = await fetch(CHECKOUT_ENDPOINT, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            items: cart
         })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
         throw new Error(
            result.error || 'Checkout could not be created.'
         );
      }

      if (!result.checkoutUrl) {
         throw new Error(
            'Square did not return a checkout URL.'
         );
      }

      // Continue to Square in the current tab.
      window.location.assign(result.checkoutUrl);
   } catch (error) {
      console.error(error);

      showCartStatus(
         error.message ||
         'Checkout could not be created. Please try again.',
         true
      );

      cartCheckoutBtn.disabled = cart.length === 0;
      cartCheckoutBtn.classList.remove('loading');
   }
}

function resetCheckoutButton() {
   cartCheckoutBtn.disabled = cart.length === 0;
   cartCheckoutBtn.classList.remove('loading');

   cartStatus.textContent = '';
   cartStatus.classList.add('hidden');
   cartStatus.classList.remove('error');
}

window.addEventListener('pageshow', resetCheckoutButton);


guardQuantity.addEventListener('input', updateCheckoutSummary);
guardQuantity.addEventListener('blur', updateCheckoutSummary);
customTextEnabled.addEventListener('change', updateCheckoutSummary);
customText.addEventListener('input', () => customText.setCustomValidity(''));
addToCartBtn.addEventListener('click', addCurrentSelectionToCart);
cartCheckoutBtn.addEventListener('click', beginSquareCheckout);

updateCheckoutSummary();
renderCart();
