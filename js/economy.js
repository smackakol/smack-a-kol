/* =========================================================================
 * Economy: PTS (the single in-game currency).
 * -------------------------------------------------------------------------
 * PTS live only in localStorage. (The Stake Vault was retired 2026-11-01
 * by LT: staked PTS + yield were returned to spendable balances on load.)
 * ========================================================================= */
window.SAK = window.SAK || {};

SAK.Points = (function () {
  const S = () => SAK.Storage.state;
  const listeners = [];
  const emit = () => listeners.forEach(fn => fn(S().points));
  return {
    get balance() { return S().points; },
    canAfford: n => S().points >= n,
    /** @param earned false for refunds/principal (doesn't count to lifetime PTS) */
    add(n, earned) {
      n = Math.round(n);
      S().points += n;
      if (n > 0 && earned !== false) S().stats.lifetimePts += n;   // drives UGC slot unlocks
      SAK.Storage.save(); emit();
    },
    spend(n) {
      n = Math.round(n);
      if (S().points < n) return false;
      S().points -= n; SAK.Storage.save(); emit(); return true;
    },
    onChange(fn) { listeners.push(fn); }
  };
})();

// Player tier by lifetime PTS (menu badge). Kept: lifetime progression
// display, not staking — the vault that used its yieldBoost is gone.
SAK.playerTier = (function () {
  const S = () => SAK.Storage.state;
  return function playerTier() {
    const lp = (S().stats && S().stats.lifetimePts) || 0;
    let cur = SAK.TIERS[0];
    for (const t of SAK.TIERS) if (lp >= t.min) cur = t;
    return cur;
  };
})();
