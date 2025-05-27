function isMatchFinished(score) {
	if (typeof score !== 'string' || score.trim() === '') {
		return true;
	}

	// Remove tiebreaks from the score
	score = score.replace(/\(\d+\)/g, '');

	const parts = score.trim().split(/\s+/);

	// Check if any part matches RET-like code (e.g., RET, RETD, retd, retired)
	if (parts.some(p => /^ret/i.test(p))) {
		return true;
	}

	// If there's only one part, it means the match is not finished
	if (parts.length == 1) {
		return false;
	}

	let playerA = 0;
	let playerB = 0;

	for (const part of parts) {
		if (part.length !== 2) {
			// If any part is not exactly two characters, consider it invalid
			// This can happen if the score is malformed or incomplete
			continue;
		}

		let A = parseInt(part[0], 10);
		let B = parseInt(part[1], 10);

		if (isNaN(A) || isNaN(B)) {
			// If any part is not a valid number, consider part invalid
			continue;
		}

		// If not 6 games played, match is not finished
		if (A + B < 6) {
			return false;
		}

		let setFinished = false;

		// If one player has more than 6 games, they must have won the set
		// or if the difference is 2 or more, one player has won the set
		// (e.g., 6-4, 7-5, etc.)
		if (A > 6 || B > 6) {
			setFinished = true;
		}

		// If the difference is 2 or more, and one player has 6 or more games
		// the set is finished
		if ((A >= 6 || B >= 6) && Math.abs(A - B) >= 2) {
			setFinished = true;
		}

		// If any set is not finished, the match is not finished
		if (!setFinished) {
			return false; 
		}

		if (A > B) {
			playerA++;
		} else if (B > A) {
			playerB++;
		}

	}

	const maxSets = parts.length > 3 ? 5 : 3;
	const setsToWin = Math.ceil(maxSets / 2);

	return playerA >= setsToWin || playerB >= setsToWin;
}

function isMatchFinishedX(score) {
	if (typeof score !== 'string' || score.trim() === '') return false;

	const parts = score.trim().split(/\s+/);

	// Check if any part matches RET-like code (e.g., RET, RETD, retd, retired)
	const retired = parts.some(p => /^ret/i.test(p));

	if (retired) return true;

	let player1Sets = 0;
	let player2Sets = 0;

	for (const raw of parts) {
		// Skip anything non-set-looking (just in case)
		if (!/^\d/.test(raw)) continue;

		const cleaned = raw.replace(/\(\d+\)/g, ''); // remove tiebreaks
		if (!/^\d{2}$/.test(cleaned)) return false;

		const p1 = parseInt(cleaned[0], 10);
		const p2 = parseInt(cleaned[1], 10);

		if (p1 === 0 && p2 === 0) return false;

		const max = Math.max(p1, p2);
		const min = Math.min(p1, p2);
		const diff = Math.abs(p1 - p2);

		const valid = (max === 6 && diff >= 2) || (max === 7 && (min === 5 || min === 6));

		if (!valid) return false;

		if (p1 > p2) player1Sets++;
		else player2Sets++;
	}

	const maxSets = parts.length > 3 ? 5 : 3;
	const setsToWin = Math.ceil(maxSets / 2);

	return player1Sets >= setsToWin || player2Sets >= setsToWin;
}

let map = {};

function test(score, expected) {
	if (map[score] !== undefined) {
		// Already tested this score
		return;
	}
	map[score] = true;
	const result = isMatchFinished(score);
	if (result !== expected) {
		console.error(`❌ Testing score: "${score}" - Failed. Expected ${expected}, got ${result}`);
	} else {
		//console.error(`✅ Testing score: "${score}" - Passed`);
	}
}

test('64 64 00', false); // third set has started, not finished
test('64 64', true); // straight-sets win in best of 3
test('75 62 60', true); // 3 sets, match finished
test('75 00 00', false); // match in progress
test('76(4) 63', true); // match finished with tiebreak
test('75 31', false); // match not over yet
test('16 64 63', true); // match finished, 3 sets
test('76 41 RET', true); // match finished

test('76 41 RET', true); // ✅ Now passes
test('76 41', false); // No RET → not finished
test('75 62 60', true); // Normal match
test('64 64', true); // 2–0
test('64 64 00', false); // Set started
test('76(2) 63', true); // With tiebreak
test('76 00 RET', true); // RET early in 2nd set

test('76 41 RET', true);
test('76 00 RET', true); // ✅ now passes
test('76 41 00 RET', true); // ✅ now passes
test('64 64', true);
test('75 62 60', true);
test('75 31', false);
test('64 64 00', false);
test('76 41', false);
test('00 00 RET', true); // nothing played

test('76 41 RET', true);
test('76 41 00 RET', true);
test('76 00 RET', true);
test('00 00 RET', true);
test('64 64', true);
test('75 31', false);
test('64 64 00', false);

test('76(4) 63', true); // ✅
test('76(2) 63', true); // ✅
test('64 64', true); // ✅
test('64 64 00', false); // ✅
test('76 41 RET', true); // ✅
test('00 00 RET', true); // ✅
test('76 41 00 RET', true); // ✅

test('76 41 RET', true);
test('76 41 00 RET', true);
test('00 00 retd', true);
test('76 41 RETIRED', true);
test('76(4) 63', true);
test('76(2) 63', true);
test('64 64 00', false);
test('75 31', false);
test('64', false);
test('64 75 46 57 53', false);
test('76 63 52', false);
test(`36 62 43 Ret'd`, true);
