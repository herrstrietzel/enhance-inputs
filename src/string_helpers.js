

function escapeICalText(text) {
  return text
    .replace(/\\/g, "\\\\")   // backslash → \\
    .replace(/\n/g, "\\n")    // newline → \n
    .replace(/,/g, "\\,")     // comma → \,
    .replace(/;/g, "\\;");    // semicolon → \;
}




export function normalizeStr(str) {
  // Step 1: Replace German umlauts and ß
  const germanMap = {
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue',
    'Ä': 'ae', 'Ö': 'oe', 'Ü': 'ue',
    'ß': 'ss'
  };
  str = str.replace(/[äöüÄÖÜß]/g, match => germanMap[match]);

  // Step 2: Remove accents (e.g., é → e)
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Step 3: Remove emojis and symbols using regex ranges
  str = str.replace(
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
    ''
  );

  // Step 4: Convert to lowercase
  str = str.toLowerCase();

  // Step 5: Replace spaces, dots, and underscores with dashes
  str = str.replace(/[\s._]+/g, '-');

  // Step 6: Remove invalid characters
  str = str.replace(/[^a-z0-9-]/g, '');

  // Step 7: Collapse multiple dashes
  str = str.replace(/-+/g, '-');

  // Step 8: Trim leading and trailing dashes
  str = str.replace(/^-+|-+$/g, '');

  return str;
}


export function correctSpellings(
  input,
  lookup = [],
  normalize = true,
  maxErrorRate = 0.4
) {
  const levenshtein = (a, b) => {
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
      Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] =
            1 +
            Math.min(
              dp[i - 1][j], // Deletion
              dp[i][j - 1], // Insertion
              dp[i - 1][j - 1] // Substitution
            );
        }
      }
    }

    return dp[a.length][b.length];
  };

  const norm = normalize ? normalizeStr(input) : input;

  if (!lookup || lookup.length === 0) return input;

  let bestMatch = input;
  let lowestError = 1;

  for (const candidate of lookup) {
    const candidateNorm = normalize ? normalizeStr(candidate) : candidate;

    // Exact match (normalized)
    if (norm === candidateNorm) {
      return candidate; // Return original candidate
    }

    const lenInput = norm.length;
    const lenCandidate = candidateNorm.length;
    if (lenInput === 0 || lenCandidate === 0) continue;

    const distance = levenshtein(norm, candidateNorm);
    const avgLen = (lenInput + lenCandidate) / 2;
    const errorRate = distance / avgLen;

    if (errorRate <= maxErrorRate && errorRate < lowestError) {
      lowestError = errorRate;
      bestMatch = candidate;
    }
  }

  return bestMatch;
}
