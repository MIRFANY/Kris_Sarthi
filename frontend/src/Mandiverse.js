import React, { useMemo, useState } from "react";

const LISTINGS = [
  {
    id: "1",
    kind: "sell",
    title: "Wheat — MP Sharbati",
    detail: "50 qtl · Grade A",
    location: "Ludhiana, PB",
    price: "₹2,420/q",
  },
  {
    id: "2",
    kind: "buy",
    title: "Maize — bulk inquiry",
    detail: "200 qtl needed",
    location: "Indore, MP",
    price: "₹2,050/q target",
  },
  {
    id: "3",
    kind: "sell",
    title: "Basmati paddy",
    detail: "120 bags",
    location: "Karnal, HR",
    price: "₹3,100/q",
  },
  {
    id: "4",
    kind: "lend",
    title: "55 HP tractor + rotavator",
    detail: "Per day / season",
    location: "Nashik, MH",
    price: "₹2,800/day",
  },
  {
    id: "5",
    kind: "lend",
    title: "Power tiller + plough set",
    detail: "Weekly hire",
    location: "Coimbatore, TN",
    price: "₹900/day",
  },
  {
    id: "6",
    kind: "lend",
    title: "Hoes, sickles, sprayer",
    detail: "Bundle · small tools",
    location: "Guntur, AP",
    price: "₹150/day",
  },
];

export default function Mandiverse({ copy }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return LISTINGS;
    if (filter === "crops") return LISTINGS.filter((x) => x.kind === "buy" || x.kind === "sell");
    return LISTINGS.filter((x) => x.kind === "lend");
  }, [filter]);

  const kindLabel = (kind) => {
    if (kind === "buy") return copy.typeBuy;
    if (kind === "sell") return copy.typeSell;
    return copy.typeLend;
  };

  return (
    <article id="feature-mandiverse" className="ks-explore-card ks-explore-card-expand ks-mandiverse">
      <span className="ks-feature-tag">{copy.tag}</span>
      <h3>{copy.title}</h3>
      <p className="ks-mandiverse-lead">{copy.subtitle}</p>

      <div className="ks-mandiverse-filters" role="tablist" aria-label={copy.filterAria}>
        {[
          { id: "all", label: copy.filterAll },
          { id: "crops", label: copy.filterCrops },
          { id: "equipment", label: copy.filterEquipment },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            className={`ks-mandiverse-filter ${filter === tab.id ? "ks-mandiverse-filter-active" : ""}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ul className="ks-mandiverse-list">
        {filtered.map((row) => (
          <li key={row.id} className="ks-mandiverse-row">
            <span className={`ks-mandiverse-pill ks-mandiverse-pill-${row.kind}`}>{kindLabel(row.kind)}</span>
            <div className="ks-mandiverse-row-main">
              <strong>{row.title}</strong>
              <span className="ks-mandiverse-detail">{row.detail}</span>
            </div>
            <span className="ks-mandiverse-loc">{row.location}</span>
            <span className="ks-mandiverse-price">{row.price}</span>
          </li>
        ))}
      </ul>

      <p className="ks-inline-note ks-mandiverse-demo">{copy.demoNote}</p>
      <div className="ks-explore-actions">
        <button type="button" className="ks-ghost" disabled>
          {copy.contactCta}
        </button>
      </div>
    </article>
  );
}
