/**
 * drawHashArt — rotated pixel-arc with multi-palette colour blocks,
 * tri-tone shading, skinny “rail” bars, row-glitch, and per-cell noise.
 *
 * Same hash ⇒ same art (no Math.random).
 */
export function drawHashArt(ctx, hash, { x = 0, y = 0, size = 1080 } = {}) {
	/* ── constants ─────────────────────────────────────────────────── */
	const PALETTES = ["#4E6E81", "#F9DBBB", "#FF0303", "#2E3840"];
	const CELL_SIZES = [36, 30, 24, 20];
	const ANGLES = [15, 25, 35, 45, 55, 65, 75];
	const THICKSTEP = [0.45, 0.55, 0.65, 0.75];

	const DENSITY = 3; // lower → busier
	const MAX_CHUNK = 4; // up-to 4×4 pixel blocks
	const MAX_GAP = 6; // 1–6 cell blank stretches

	const RAIL_CLR = "#f8f8f8";
	const RAIL_MOD = 18; // 1 / 18 chance per chunk
	const RAIL_LEN = [3, 4, 5, 6]; // rail length in cells

	const GLITCH_MAX_SHIFT = 1; // ±1 cell horizontal row offset
	const NOISE_MOD = 10; // 1 / 10 chance per empty cell → speckle

	/* ── helpers ────────────────────────────────────────────────────── */
	const clean = hash.replace(/^0x/, "");
	const byte = (i) =>
		parseInt(
			clean.slice(
				(i % (clean.length / 2)) * 2,
				(i % (clean.length / 2)) * 2 + 2
			),
			16
		);

	const shade = (hex, pct) => {
		const [r, g, b] = hex.match(/\w\w/g).map((h) => parseInt(h, 16));
		const t = pct < 0 ? 0 : 255,
			p = Math.abs(pct) / 100;
		return (
			"#" +
			[r, g, b]
				.map((c) => Math.round((t - c) * p) + c)
				.map((c) => c.toString(16).padStart(2, "0"))
				.join("")
		);
	};

	/* ── primary & secondary palettes ───────────────────────────────── */
	const primaryIdx = byte(0) % PALETTES.length;

	// guarantee secondary ≠ primary
	const secondaryIdx =
		(primaryIdx + 1 + (byte(1) % (PALETTES.length - 1))) % PALETTES.length;

	const P_ACCENT = PALETTES[primaryIdx];
	const P_LIGHT = shade(P_ACCENT, +18);
	const P_SHADOW = shade(P_ACCENT, -20);

	const S_ACCENT = PALETTES[secondaryIdx];
	const S_LIGHT = shade(S_ACCENT, +18);
	const S_SHADOW = shade(S_ACCENT, -20);

	/* ── geometry parameters ───────────────────────────────────────── */
	const CELL = CELL_SIZES[byte(1) % CELL_SIZES.length];
	const ROT = (ANGLES[byte(2) % ANGLES.length] * Math.PI) / 180;
	const thicknessFactor = THICKSTEP[byte(3) % THICKSTEP.length];

	const innerRBase = size * (0.18 + (byte(4) & 0x0f) / 128);
	const outerRBase = innerRBase + size * thicknessFactor;

	/* ── canvas prep ───────────────────────────────────────────────── */
	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = "#1b1d1c"; // full-canvas background
	ctx.fillRect(x, y, size, size);

	ctx.save();
	ctx.translate(x + size / 2, y + size / 2);
	ctx.rotate(ROT);
	ctx.translate(-size / 2, -size / 2);

	const cols = Math.ceil(size / CELL) + MAX_CHUNK * 2;
	let idx = 5; // byte cursor

	/* ── paint loop ─────────────────────────────────────────────────── */
	for (let row = -MAX_CHUNK; row < cols; row++) {
		const rowShift =
			(((byte(idx + row) >> 5) & (GLITCH_MAX_SHIFT * 2)) - GLITCH_MAX_SHIFT) *
			CELL;

		const innerR = innerRBase + (byte(idx) % CELL) - CELL / 2;
		const outerR = outerRBase + (byte(idx + 1) % CELL) - CELL / 2;

		for (let col = -MAX_CHUNK; col < cols; ) {
			const b = byte(idx);
			const drawChunk = b % DENSITY === 0;

			if (drawChunk) {
				/* ── chunk geometry & colour ─────────────────────────────── */
				let w, h, color;
				const isRail = b % RAIL_MOD === 0;

				if (isRail) {
					const len = RAIL_LEN[(b >> 4) & 0x03];
					if (b & 0x20) {
						w = 1;
						h = len;
					} else {
						w = len;
						h = 1;
					}
					color = RAIL_CLR;
				} else {
					w = Math.min(1 + ((b >> 4) & 0x03), MAX_CHUNK);
					h = Math.min(1 + ((b >> 2) & 0x03), MAX_CHUNK);

					const useSecondary = b & 0x02; // bit 1 decides palette group
					const base = useSecondary ? S_ACCENT : P_ACCENT;
					const light = useSecondary ? S_LIGHT : P_LIGHT;
					const shadow = useSecondary ? S_SHADOW : P_SHADOW;

					if (b & 0x40) color = shadow;
					else if (b & 0x20) color = light;
					else color = base;
				}

				const cx = col * CELL + rowShift + (w * CELL) / 2 - size / 2;
				const cy = row * CELL + (h * CELL) / 2 - size / 2;
				if (Math.hypot(cx, cy) > innerR && Math.hypot(cx, cy) < outerR) {
					ctx.fillStyle = color;
					ctx.fillRect(col * CELL + rowShift, row * CELL, w * CELL, h * CELL);
				}

				col += w;
				idx += 1;
			} else {
				/* ── gap: per-cell noise speckles ────────────────────────── */
				const gap = 1 + ((b >> 4) & (MAX_GAP - 1));

				for (let g = 0; g < gap; g++) {
					const colPos = col + g;
					const cx = colPos * CELL + rowShift + CELL / 2 - size / 2;
					const cy = row * CELL + CELL / 2 - size / 2;

					if (Math.hypot(cx, cy) > innerR && Math.hypot(cx, cy) < outerR) {
						const nb = byte(idx + g);
						if (nb % NOISE_MOD === 0) {
							const useSecondary = nb & 0x02;
							ctx.fillStyle =
								nb & 0x08
									? useSecondary
										? S_LIGHT
										: P_LIGHT
									: useSecondary
									? S_SHADOW
									: P_SHADOW;

							ctx.fillRect(colPos * CELL + rowShift, row * CELL, CELL, CELL);
						}
					}
				}

				col += gap;
				idx += gap;
			}
		}
	}

	ctx.restore();
	return {
		primaryAccent: P_ACCENT,
		secondaryAccent: S_ACCENT,
		paletteIdx: primaryIdx,
		secondaryIdx,
	};
}
