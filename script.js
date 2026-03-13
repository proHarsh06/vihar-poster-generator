/**
 * script.js — Vihar Poster Generator
 * =====================================
 * Original simple app with dropdowns.
 * Poster layout (500 × 700 px):
 *
 *  ┌──────────────────────────┐
 *  │      [ LOGO at top ]     │  ← logo drawn here (NEW)
 *  │    કાલે વિહાર (title)    │
 *  │    ✦ આવો સાથ ચાલીએ ✦    │
 *  │    [ circular photo ]    │
 *  │    Route text            │
 *  │    Team text             │
 *  └──────────────────────────┘
 */

// ── Global state ──────────────────────────────────────
let uploadedPhoto = null;  // user's person photo
// Logo auto-loads from logo.png in the same folder
const uploadedLogo = new Image();
uploadedLogo.src = 'logo.png';

// ── DOM refs ──────────────────────────────────────────
const canvas     = document.getElementById('posterCanvas');
const ctx        = canvas.getContext('2d');
const canvasHint = document.getElementById('canvasHint');
const actionBtns = document.getElementById('actionButtons');

// Canvas size: 500 wide × 700 tall
const W = canvas.width;   // 500
const H = canvas.height;  // 700

// ── Photo upload ──────────────────────────────────────
document.getElementById('photoInput').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      uploadedPhoto = img;
      document.getElementById('previewImg').src = e.target.result;
      document.getElementById('photoPreview').classList.remove('hidden');
      document.getElementById('uploadLabel').textContent = '✓ ' + file.name.substring(0, 22);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});



// ── Member field management ───────────────────────────
function addMember() {
  const container = document.getElementById('membersContainer');
  const count = container.querySelectorAll('.member-row').length;
  if (count >= 10) { alert('⚠️ મહત્તમ 10 સભ્યો ઉમેરી શકાય.'); return; }
  const row = document.createElement('div');
  row.className = 'member-row';
  row.innerHTML = `
    <input type="text" class="styled-input member-input" placeholder="સભ્ય ${count + 1} નું નામ..." />
    <button class="btn-remove-member" onclick="removeMember(this)" title="Remove">✕</button>
  `;
  container.appendChild(row);
}

function removeMember(btn) {
  const container = document.getElementById('membersContainer');
  const rows = container.querySelectorAll('.member-row');
  if (rows.length <= 1) { alert('⚠️ ઓછામાં ઓછા 2 સભ્ય જોઈએ.'); return; }
  btn.parentElement.remove();
}


// Shows a text box when user picks "other" from dropdown
function toggleCustom(which) {
  const select = document.getElementById(which + 'Select');
  const input  = document.getElementById(which + 'Custom');
  if (select.value === 'other') {
    input.classList.remove('hidden');
    input.focus();
  } else {
    input.classList.add('hidden');
    input.value = '';
  }
}

// ── Helper: get final value from dropdown or custom input ──
function getPoint(which) {
  const select = document.getElementById(which + 'Select');
  const input  = document.getElementById(which + 'Custom');
  if (select.value === 'other') {
    return input.value.trim();
  }
  return select.value;
}

// ── MAIN: Generate Poster ─────────────────────────────
function generatePoster() {
  const start = getPoint('start');
  const end   = getPoint('end');
  const team  = document.getElementById('teamSelect').value;

  const memberInputs = document.querySelectorAll('.member-input');
  const members = Array.from(memberInputs).map(i => i.value.trim()).filter(Boolean);

  if (!start)         { alert('⚠️ કૃપા કરીને Start Point પસંદ કરો.'); return; }
  if (!end)           { alert('⚠️ કૃપા કરીને End Point પસંદ કરો.');   return; }
  if (!team)          { alert('⚠️ કૃપા કરીને ટીમ પસંદ કરો.');         return; }
  if (!uploadedPhoto) { alert('⚠️ કૃપા કરીને ફોટો અપલોડ કરો.');       return; }
  if (members.length < 1) { alert('⚠️કૃપા કરીને સભ્યોના નામ લખો.'); return; }

  // Combine into route string: "સૂરત → નવસારી"
  const bhagwant = document.getElementById('bhagwantInput').value.trim();

  const route = start + ' → ' + end;
  drawPoster(route, team, members, bhagwant);
}

// ── Core poster drawing ───────────────────────────────
/**
 * Draws the full poster onto the canvas in layers:
 *   1. Gradient background
 *   2. Logo at top center       ← NEW
 *   3. Title text "કાલે વિહાર"
 *   4. Circular photo frame
 *   5. Route text
 *   6. Team text
 *   7. Footer
 */
function drawPoster(route, team, members, bhagwant) {
  ctx.clearRect(0, 0, W, H);

  // ── Layer 1: Gradient background ──
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,   '#1A1040');
  bg.addColorStop(0.5, '#2D1F6E');
  bg.addColorStop(1,   '#FF6B00');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Dot texture overlay
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let x = 0; x < W; x += 30) {
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Gold border lines
  const border = ctx.createLinearGradient(0, 0, W, 0);
  border.addColorStop(0,   '#FF6B00');
  border.addColorStop(0.5, '#FFD166');
  border.addColorStop(1,   '#FF6B00');
  ctx.fillStyle = border;
  ctx.fillRect(0, 0, W, 6);
  ctx.fillRect(0, H - 6, W, 6);
  ctx.strokeStyle = 'rgba(255,209,102,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, W - 28, H - 28);

  // ── Layer 2: Logo ──
  drawLogo();

  // ── Layer 3: Title ──
  drawTitle();

  // ── Layer 4: Vihar Complete (now ABOVE photo) ──
  drawpreText();

  // ── Layer 5: Photo (now BELOW Vihar Complete) ──
  drawPhoto();

  // ── Layer 6: Route text ──
  drawRouteText(route);

  // ── Layer 7: Team text ──
  drawTeamText(team);

  // ── Layer 8: Bhagwant text ──
  drawBhagwantText(bhagwant);

  // ── Layer 9: Members ──
  drawMembersText(members);

  // ── Layer 9: Footer ──
  drawFooter();

  // Show action buttons
  actionBtns.classList.remove('hidden');
  canvasHint.classList.add('hidden');
}

// ── Draw logo at top center ───────────────────────────
/**
 * Places the logo in a circle at the very top of the poster.
 * If no logo uploaded, draws a subtle placeholder ring.
 *
 * Logo area: y = 18 to y = 108 (circle center at y=68, r=46)
 */
function drawLogo() {
  const cx = W / 2;  // horizontal center
  const cy = 72;     // vertical center of logo
  const r  = 44;     // circle radius

  ctx.save();

  // Outer glow
  ctx.beginPath();
  ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 209, 102, 0.15)';
  ctx.fill();

  // Gold ring border
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFD166';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Clip to circle so logo stays inside
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (uploadedLogo) {
    // Center-crop the logo to fill the circle
    const img    = uploadedLogo;
    const size   = r * 2;
    const srcMin = Math.min(img.width, img.height);
    const sx     = (img.width  - srcMin) / 2;
    const sy     = (img.height - srcMin) / 2;
    // drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH)
    ctx.drawImage(img, sx, sy, srcMin, srcMin, cx - r, cy - r, size, size);
  } else {
    // Placeholder: semi-transparent dark circle with "LOGO" label
    ctx.fillStyle = 'rgba(26, 16, 64, 0.6)';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
    ctx.save();
    ctx.font = 'bold 14px "Sora", sans-serif';
    ctx.fillStyle = 'rgba(255, 209, 102, 0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOGO', cx, cy);
  }

  ctx.restore();
}

// ── Draw title text ───────────────────────────────────
/**
 * "કાલે વિહાર" in large gold text, centered.
 * Positioned below logo (logo bottom ~116px).
 */
function drawTitle() {
  const cx = W / 2;

  // Pill background behind title
  ctx.save();
  ctx.fillStyle = 'rgba(255, 107, 0, 0.85)';
  roundRect(ctx, cx - 225, 128, 450, 48, 36);
  ctx.fill();
  ctx.restore();

  // Title text
  ctx.save();
  ctx.font = 'bold 35px "Comic Sans", sans-serif';
  ctx.fillStyle = '#FFD166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 8;
  ctx.fillText('✦Navsari Vihar Updates✦', cx, 155);
  ctx.restore();
}

// ── Draw rectangle photo (fully visible, no crop) ────
/**
 * Draws the uploaded photo fully visible inside a rectangle.
 * Uses "contain" logic — full image fits inside box,
 * nothing is cropped. Empty sides filled with dark bg.
 */
function drawPhoto() {
  const boxW = 340;
  const boxH = 220;
  const px   = (W - boxW) / 2;
  const py   = 248;

  ctx.save();

  // White border frame
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(px - 4, py - 4, boxW + 8, boxH + 8);

  // Dark background inside box
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(px, py, boxW, boxH);

  // Scale image to fit fully inside box (no cropping)
  const img    = uploadedPhoto;
  const scale  = Math.min(boxW / img.width, boxH / img.height);
  const drawW  = img.width  * scale;
  const drawH  = img.height * scale;
  const drawX  = px + (boxW - drawW) / 2;
  const drawY  = py + (boxH - drawH) / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}
//  ── Draw pre text ───────────────────────────────────
function drawpreText() {
  const cx = W / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(26, 16, 64, 0.75)';
  roundRect(ctx, cx - 170, 188, 340, 40, 20);
  ctx.fill();

  ctx.font = 'bold 20px "Noto Sans Gujarati", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.fillText('★ Vihar Complete ★', cx, 208);
  ctx.restore();
}

// ── Draw route text ───────────────────────────────────
function drawRouteText(route) {
  const cx = W / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(26, 16, 64, 0.75)';
  roundRect(ctx, cx - 170, 482, 340, 38, 19);
  ctx.fill();

  ctx.font = 'bold 19px "Noto Sans Gujarati", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.fillText('🗺️  ' + route, cx, 501);
  ctx.restore();
}

// ── Draw team text ────────────────────────────────────
function drawTeamText(team) {
  const cx = W / 2;
  const teamText = team + ' Team ';

  ctx.save();
  ctx.fillStyle = 'rgba(255, 107, 0, 0.9)';
  roundRect(ctx, cx - 170, 528, 340, 38, 19);
  ctx.fill();

  ctx.font = 'bold 19px "Noto Sans Gujarati", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.fillText('👥  ' + teamText, cx, 547);
  ctx.restore();
}

// ── Draw Shraman-Shramni Bhagwant text ───────────────
function drawBhagwantText(bhagwant) {
  if (!bhagwant) return;
  const cx = W / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(45, 31, 110, 0.9)';
  roundRect(ctx, cx - 210, 574, 420, 38, 19);
  ctx.fill();

  ctx.font = 'bold 16px "Noto Sans Gujarati", sans-serif';
  ctx.fillStyle = '#FFD166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.fillText('🙏 ' + bhagwant, cx, 593);
  ctx.restore();
}

// ── Draw members text (below bhagwant) ───────────────
function drawMembersText(members) {
  const cx = W / 2;
  const label = '🧑 ' + members.join(' • ');

  ctx.save();
  ctx.fillStyle = 'rgba(26, 16, 64, 0.85)';
  roundRect(ctx, cx - 210, 620, 420, 38, 19);
  ctx.fill();

  ctx.font = 'bold 14px "Noto Sans Gujarati", sans-serif';
  ctx.fillStyle = '#FFD166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;

  let fontSize = 14;
  ctx.font = `bold ${fontSize}px "Noto Sans Gujarati", sans-serif`;
  while (ctx.measureText(label).width > 400 && fontSize > 9) {
    fontSize--;
    ctx.font = `bold ${fontSize}px "Noto Sans Gujarati", sans-serif`;
  }

  ctx.fillText(label, cx, 639);
  ctx.restore();
}

// ── Draw footer ───────────────────────────────────────
function drawFooter() {
  const cx = W / 2;

  ctx.save();
  ctx.font = '14px "Sora", sans-serif';
  ctx.fillStyle = 'rgba(255, 209, 102, 0.75)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('— Vihar Seva Group Navsari —', cx, 668);

  ctx.strokeStyle = 'rgba(255,209,102,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 678); ctx.lineTo(440, 678);
  ctx.stroke();

  ctx.font = '12px "Sora", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('#ViharSeva', cx, 690);
  ctx.restore();
}

// ── Utility: rounded rectangle path ──────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Download ──────────────────────────────────────────
function downloadPoster() {
  const link    = document.createElement('a');
  link.href     = canvas.toDataURL('image/png');
  link.download = 'vihar-poster.png';
  link.click();
}

// ── Share ─────────────────────────────────────────────
async function sharePoster() {
  if (!navigator.canShare) {
    alert('⚠️ Share supported નથી. Poster download કરો.');
    return;
  }
  canvas.toBlob(async blob => {
    const file = new File([blob], 'vihar-poster.png', { type: 'image/png' });
    const data = { title: 'વિહાર પોસ્ટર', text: 'વિહાર Complete', files: [file] };
    if (navigator.canShare(data)) {
      try { await navigator.share(data); }
      catch (e) { if (e.name !== 'AbortError') alert('Share failed.'); }
    } else {
      try { await navigator.share({ title: data.title, text: data.text }); }
      catch { alert('Share failed. Poster download કરો.'); }
    }
  }, 'image/png');
}
