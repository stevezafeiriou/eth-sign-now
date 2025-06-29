// src/utils/hashArt.js
export function drawHashArt(ctx, hash, x, y, size) {
	const grid = 12; // 12×12
	const cell = size / grid; // 800/16 = exactly 50px

	// your 3-color palette
	const COLORS = {
		dark: "#1b1d1c",
		white: "#ffffff",
		blue: "#007bff",
	};

	// disable anti-aliasing / smoothing to avoid gaps
	ctx.imageSmoothingEnabled = false;

	// helper to grab a pseudo-random byte
	function byte(i) {
		const idx = 2 + (i % ((hash.length - 2) / 2)) * 2;
		return parseInt(hash.slice(idx, idx + 2), 16);
	}

	// 1) white background
	ctx.fillStyle = COLORS.white;
	ctx.fillRect(x, y, size, size);

	let idx = 0;
	for (let row = 0; row < grid; row++) {
		for (let col = 0; col < grid / 2; col++, idx++) {
			const b = byte(idx);
			let color;

			// ~1/32 chance for blue
			if (b & 0x80 && b % 32 === 0) {
				color = COLORS.blue;
			}
			// next‐bit for dark fill
			else if (b & 0x40) {
				color = COLORS.dark;
			}
			// else leave white
			else {
				color = COLORS.white;
			}

			// left cell
			ctx.fillStyle = color;
			ctx.fillRect(x + col * cell, y + row * cell, cell, cell);

			// mirrored right cell
			const mcol = grid - 1 - col;
			ctx.fillRect(x + mcol * cell, y + row * cell, cell, cell);
		}
	}
}
