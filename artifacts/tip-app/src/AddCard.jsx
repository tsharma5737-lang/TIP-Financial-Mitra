import { useState, useEffect, useMemo } from "react";
import { getAllCards, getMyCards, addCard } from "./lib/apiClient";

const NAVY      = "#0D1A2E";
const NAVY_CARD = "#112240";
const GOLD      = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM  = "#8a6f32";

const s = {
  page: { background: NAVY, minHeight: "100%", paddingBottom: 96, fontFamily: "'Inter', sans-serif" },
  header: {
    background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`,
    padding: "18px 16px 14px", borderBottom: `1px solid ${GOLD_DIM}33`,
    display: "flex", alignItems: "center", gap: 10,
  },
  backBtn: { background: "transparent", border: "none", color: "#7a9bcc", fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1 },
  headerTitle: { fontSize: 17, fontWeight: 800, color: "#fff" },
  headerSub: { fontSize: 11, color: "#7a9bcc", marginTop: 2 },

  searchWrap: { padding: "14px 16px 4px" },
  searchInput: {
    width: "100%", background: NAVY_CARD, border: "1px solid #1e3a6a", borderRadius: 12,
    padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box",
  },

  list: { padding: "10px 16px 0", display: "flex", flexDirection: "column", gap: 8 },
  cardRow: { background: NAVY_CARD, border: "1px solid #1e3a6a", borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  cardLeft: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  cardBank: { fontSize: 9, fontWeight: 700, color: "#4a6a9a", letterSpacing: 1, textTransform: "uppercase" },
  cardName: { fontSize: 14, fontWeight: 700, color: "#fff" },
  cardMeta: { fontSize: 10, color: "#7a9bcc", fontWeight: 500 },

  addBtn: {
    background: GOLD, color: "#0a1628", border: "none", borderRadius: 9,
    padding: "8px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer",
    fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap",
  },
  addedPill: {
    background: "#4ade8018", border: "1px solid #4ade8044", color: "#4ade80",
    borderRadius: 9, padding: "7px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap",
  },
  addingPill: {
    background: "#7a9bcc18", border: "1px solid #7a9bcc44", color: "#7a9bcc",
    borderRadius: 9, padding: "7px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap",
  },

  stateWrap: { padding: "60px 20px", textAlign: "center" },
  stateText: { color: "#7a9bcc", fontSize: 14, fontWeight: 500 },
  errorText: { color: "#f87171", fontSize: 13, fontWeight: 600 },
  emptyResult: { padding: "40px 20px", textAlign: "center", color: "#4a6a9a", fontSize: 13 },
};

function formatFee(fee) {
  if (!fee || fee === 0) return "No fee";
  return `₹${fee.toLocaleString("en-IN")}/yr`;
}

export default function AddCard({ onBack, onCardAdded, isOnboarding, onContinue }) {
  const [allCards, setAllCards] = useState([]);
  const [myCardIds, setMyCardIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [justAddedIds, setJustAddedIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [all, mine] = await Promise.all([getAllCards(), getMyCards()]);
        if (cancelled) return;
        setAllCards(Array.isArray(all) ? all : (all?.cards ?? []));
        const mineArr = Array.isArray(mine) ? mine : (mine?.cards ?? []);
        setMyCardIds(new Set(mineArr.map((c) => c.card_id ?? c.id)));
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not load the card list. Please check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCards;
    return allCards.filter(
      (c) => c.card_name?.toLowerCase().includes(q) || c.bank_name?.toLowerCase().includes(q)
    );
  }, [allCards, search]);

  async function handleAdd(card) {
    if (addingId) return;
    setAddingId(card.id);
    try {
      await addCard(card.id);
      setMyCardIds((prev) => new Set(prev).add(card.id));
      setJustAddedIds((prev) => new Set(prev).add(card.id));
      onCardAdded?.();
    } catch (err) {
      setError(err?.message || "Could not add this card. Please try again.");
    } finally {
      setAddingId(null);
    }
  }

  if (loading) {
    return <div style={s.page}><div style={s.stateWrap}><span style={s.stateText}>Loading available cards…</span></div></div>;
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        {!isOnboarding && <button style={s.backBtn} onClick={onBack}>←</button>}
        <div>
          <div style={s.headerTitle}>{isOnboarding ? "Add Your Cards" : "Add a Card"}</div>
          <div style={s.headerSub}>
            {isOnboarding
              ? "Add at least one card to get started with TIP"
              : `${allCards.length} cards available`}
          </div>
        </div>
      </div>

      <div style={s.searchWrap}>
        <input
          style={s.searchInput}
          placeholder="Search by bank or card name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div style={{ padding: "10px 16px 0" }}>
          <span style={s.errorText}>{error}</span>
        </div>
      )}

      <div style={s.list}>
        {filtered.length === 0 && (
          <div style={s.emptyResult}>No cards match "{search}"</div>
        )}
        {filtered.map((card) => {
          const isOwned = myCardIds.has(card.id);
          const isAdding = addingId === card.id;
          const justAdded = justAddedIds.has(card.id);
          return (
            <div key={card.id} style={s.cardRow}>
              <div style={s.cardLeft}>
                <span style={s.cardBank}>{card.bank_name}</span>
                <span style={s.cardName}>{card.card_name}</span>
                <span style={s.cardMeta}>
                  {card.network ? `${card.network} · ` : ""}{formatFee(card.annual_fee)}
                  {card.upi_linked === false ? " · Not UPI-linked" : ""}
                </span>
              </div>
              {isOwned ? (
                <span style={s.addedPill}>{justAdded ? "✓ Added" : "✓ Owned"}</span>
              ) : isAdding ? (
                <span style={s.addingPill}>Adding…</span>
              ) : (
                <button style={s.addBtn} onClick={() => handleAdd(card)}>+ Add</button>
              )}
            </div>
          );
        })}
      </div>

      {isOnboarding && (
        <div style={{ padding: "20px 16px 0" }}>
          <button
            onClick={onContinue}
            disabled={myCardIds.size === 0}
            style={{
              width: "100%", background: myCardIds.size === 0 ? "#1a2f50" : GOLD,
              color: myCardIds.size === 0 ? "#4a6a9a" : "#0a1628",
              border: "none", borderRadius: 12, padding: "14px",
              fontSize: 14, fontWeight: 800, cursor: myCardIds.size === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {myCardIds.size === 0 ? "Add at least one card to continue" : `Continue with ${myCardIds.size} card${myCardIds.size > 1 ? "s" : ""} →`}
          </button>
        </div>
      )}
    </div>
  );
}
