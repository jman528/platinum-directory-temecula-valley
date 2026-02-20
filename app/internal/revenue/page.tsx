"use client";

import { useState, useEffect } from "react";

// ─── Password Gate ──────────────────────────────────────────
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().toLowerCase() === "frank") {
      sessionStorage.setItem("pd_revenue_auth", "1");
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div style={{ background: "#030712", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 400, padding: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>💎</div>
        <h1 style={{ color: gold, fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Revenue Architecture</h1>
        <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 32px", letterSpacing: 2, textTransform: "uppercase" }}>Confidential — Internal Team Only</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter passcode"
            autoFocus
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 12, border: `1px solid ${error ? "#DC2626" : "#374151"}`,
              background: "rgba(255,255,255,0.05)", color: "#FFF", fontSize: 16, textAlign: "center",
              outline: "none", backdropFilter: "blur(8px)", boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
          />
          {error && <p style={{ color: "#DC2626", fontSize: 12, marginTop: 8 }}>Invalid passcode</p>}
          <button
            type="submit"
            style={{
              marginTop: 16, width: "100%", padding: "14px 20px", borderRadius: 12, border: "none",
              background: gold, color: "#030712", fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "opacity 0.2s",
            }}
          >
            Access
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Design tokens ──────────────────────────────────────────
const gold = "#C9A84C";
const navy = "#0A0E1A";
const purple = "#7C3AED";
const blue = "#3B82F6";
const green = "#059669";
const red = "#DC2626";
const orange = "#EA580C";

const tabList = ["Fee Structure", "Points Structure", "Traffic & Smart Offers", "Tracking & UTM", "Share UX & Links", "Internal ROI", "Payment Methods"];

// ─── Shared Components ──────────────────────────────────────
function Badge({ children, color = purple }: { children: React.ReactNode; color?: string }) {
  return <span style={{ background: color + "22", color, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{children}</span>;
}

function Card({ title, children, accent = gold }: { title?: string; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ background: "#111827", border: `1px solid ${accent}33`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
      {title && <h3 style={{ color: accent, fontSize: 15, fontWeight: 700, marginBottom: 12, marginTop: 0 }}>{title}</h3>}
      {children}
    </div>
  );
}

function Stat({ label, value, sub, color = gold }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#0A0E1A", padding: 14, borderRadius: 8, textAlign: "center", border: `1px solid ${color}22` }}>
      <div style={{ color, fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ color: "#E5E7EB", fontSize: 12, fontWeight: 600, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ color: "#6B7280", fontSize: 10, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Tab 1: Fee Structure ───────────────────────────────────
function FeeStructure() {
  return (
    <div>
      <h2 style={{ color: gold, marginBottom: 4 }}>Smart Offer Fee Structure</h2>
      <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 0 }}>Platform fee (PD keeps) + Affiliate fee ON TOP = Total business pays</p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead><tr style={{ background: navy }}>
          {["Tier","Monthly","Setup Fee","PD Platform Fee","+Affiliate","Total to Biz","Groupon"].map(h => (
            <th key={h} style={{ color: gold, padding: "10px 6px", fontSize: 12, textAlign: "center", borderBottom: `2px solid ${gold}44` }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {[["Free","$0","$0","30%","+5%","35%","50%"],["Verified","$99/mo","$500","25%","+5%","30%","50%"],["Partner","$799/mo","$1,000","20%","+5%","25%","50%"],["Elite","$3,500/mo","$1,500","20%","+5%","25%","50%"]].map((row, i) => (
            <tr key={i} style={{ background: i % 2 ? "#1F2937" : "#111827" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "10px 6px", fontSize: 12, textAlign: "center", fontWeight: j===0||j===5?700:400, color: j===5?green:j===6?red:"#E5E7EB" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Card title="Stripe Connect Flow" accent={blue}>
        <div style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 1.8 }}>
          <p style={{ margin: "0 0 8px" }}><strong style={{ color: "#FFF" }}>One charge to the business.</strong> Stripe takes the total fee.</p>
          <p style={{ margin: "0 0 6px" }}>If affiliate referred: auto-split — PD gets platform fee, affiliate gets 5%</p>
          <p style={{ margin: "0 0 6px" }}>If NO affiliate: PD keeps the full total</p>
          <p style={{ margin: 0, color: gold }}>Business sees the same total either way.</p>
        </div>
      </Card>
      <Card title="ROI by Tier" accent={green}>
        <div style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 1.7 }}>
          {[
            ["Winery at Partner ($799/mo):","40 vouchers x $59 = $2,360 gross. 25% fee = $590. Keeps $1,770. Minus $799 sub =","$971/mo net + $1,800 on-site upsell = 3.5x ROI"],
            ["Restaurant at Verified ($99/mo):","30 vouchers x $25 = $750. 30% fee = $225. Keeps $525. Minus $99 =","$426/mo net + upsell = 8x ROI"],
            ["Any Business as Traffic Driver:","500 clicks + 100 signups + giveaway entries + affiliate commissions =","$320+/mo in points + commissions on top of own sales"],
          ].map(([title, desc, result], i) => (
            <div key={i} style={{ background: "#052e16", padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <strong style={{ color: gold }}>{title}</strong>
              <p style={{ margin: "4px 0 0", fontSize: 11 }}>{desc} <span style={{ color: green, fontWeight: 700 }}>{result}</span></p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab 2: Points Structure ────────────────────────────────
function PointsStructure() {
  return (
    <div>
      <h2 style={{ color: gold, marginBottom: 4 }}>Points Structure</h2>
      <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 0 }}>1,000 pts = $1.00 | Cash out at $10 | Use on Smart Offers ($30 min) | Top up wallet anytime</p>
      <Card title="First 10 Minutes — New User Onboarding" accent={green}>
        <div style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 2.2 }}>
          {[["1","Sign up for account","+2,500 pts","$2.50"],["2","Verify phone number","+1,000 pts","$1.00"],["3","Complete profile","+500 pts","$0.50"],["4","Enter weekly giveaway","+500 pts","$0.50"],["5","First social share","+1,000 pts","$1.00"]].map(([n,a,p,v]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ background: green, color: "#FFF", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{n}</span>
              <span style={{ flex: 1 }}>{a}</span>
              <span style={{ color: green, fontWeight: 700, width: 90, textAlign: "right" }}>{p}</span>
              <span style={{ color: gold, width: 50, textAlign: "right", fontSize: 11 }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: `2px solid ${gold}`, marginTop: 10, paddingTop: 10 }}>
            <strong style={{ color: gold, fontSize: 15 }}>Total in 10 minutes: 5,500 pts = $5.50</strong>
          </div>
        </div>
      </Card>
      <Card title="Redemption Options" accent={gold}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={{ background: "#0A0E1A", padding: 14, borderRadius: 8, border: `1px solid ${green}33` }}>
            <div style={{ color: green, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Smart Offer Discount</div>
            <div style={{ color: "#D1D5DB", fontSize: 11, lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 4px" }}>Use ANY amount of points</p>
              <p style={{ margin: "0 0 4px" }}>Min offer value: <strong>$30</strong></p>
              <p style={{ margin: "0 0 4px" }}>1,000 pts = $1.00 off</p>
              <p style={{ margin: 0, color: green, fontWeight: 700 }}>Available immediately!</p>
            </div>
          </div>
          <div style={{ background: "#0A0E1A", padding: 14, borderRadius: 8, border: `1px solid ${gold}33` }}>
            <div style={{ color: gold, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Cash Out</div>
            <div style={{ color: "#D1D5DB", fontSize: 11, lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 4px" }}>Min: <strong>10,000 pts ($10)</strong></p>
              <p style={{ margin: "0 0 4px" }}>PayPal or Venmo</p>
              <p style={{ margin: "0 0 4px" }}>Processed in 48 hours</p>
              <p style={{ margin: 0 }}>No monthly maximum</p>
            </div>
          </div>
          <div style={{ background: "#0A0E1A", padding: 14, borderRadius: 8, border: `1px solid ${purple}33` }}>
            <div style={{ color: purple, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Top Up Wallet</div>
            <div style={{ color: "#D1D5DB", fontSize: 11, lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 4px" }}>Buy points with cash</p>
              <p style={{ margin: "0 0 4px" }}>$50 = 50K + 2,500 bonus</p>
              <p style={{ margin: "0 0 4px" }}>$100 = 100K + 10K bonus</p>
              <p style={{ margin: 0 }}>Like a Temecula gift card</p>
            </div>
          </div>
        </div>
      </Card>
      <Card title="Ongoing Earning Actions" accent={blue}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: navy }}>
            {["Action","Points","Value","Limit"].map(h => (<th key={h} style={{ color: gold, padding: "6px 4px", fontSize: 11, textAlign: "left", borderBottom: `2px solid ${gold}44` }}>{h}</th>))}
          </tr></thead>
          <tbody>
            {[["Share listing/offer","25 pts","$0.025","100/day"],["Referral click","10 pts","$0.01","1x/person/day"],["Referral signs up","500 pts","$0.50","Unlimited"],["Referral enters giveaway","1,000 pts","$1.00","Unlimited"],["Referral buys offer","5% as pts","Varies","Unlimited"],["Daily login","10 pts","$0.01","1/day"],["7-day streak","250 pts","$0.25","Weekly"],["30-day streak","2,500 pts","$2.50","Monthly"],["Google review","1,000 pts","$1.00","Once"],["Social follow","250 pts","$0.25","1/platform"],["Referral subscribes (biz)","50,000 pts","$50.00","Once/biz"]].map((r, i) => (
              <tr key={i} style={{ background: i%2?"#1F2937":"#111827" }}>
                {r.map((c, j) => (<td key={j} style={{ padding: "6px 4px", fontSize: 11, color: j===1?green:"#E5E7EB", fontWeight: j===0?600:400 }}>{c}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Tab 3: Traffic Projections ─────────────────────────────
function TrafficProjections() {
  const [month, setMonth] = useState(6);

  const scenarios = {
    conservative: {
      label: "Conservative", icon: "📊",
      paidBudget: 2000, cpc: 0.75,
      organicStart: 500, organicGrowth: 0.20,
      signupRate: 0.15, shareRate: 0.25, avgShareReach: 8, shareClickRate: 0.12,
      offerConvRate: 0.06, avgOfferPrice: 42, avgFeeRate: 0.27, color: blue,
    },
    moderate: {
      label: "Moderate", icon: "🚀",
      paidBudget: 3500, cpc: 0.65,
      organicStart: 1000, organicGrowth: 0.30,
      signupRate: 0.18, shareRate: 0.35, avgShareReach: 12, shareClickRate: 0.15,
      offerConvRate: 0.08, avgOfferPrice: 45, avgFeeRate: 0.26, color: purple,
    },
    aggressive: {
      label: "Aggressive (Viral Catch)", icon: "🔥",
      paidBudget: 5000, cpc: 0.60,
      organicStart: 2000, organicGrowth: 0.40,
      signupRate: 0.22, shareRate: 0.45, avgShareReach: 18, shareClickRate: 0.18,
      offerConvRate: 0.10, avgOfferPrice: 48, avgFeeRate: 0.25, color: green,
    },
  };

  type Scenario = typeof scenarios.conservative;

  function project(s: Scenario, months: number) {
    let totalUsers = 0;
    const data = [];
    let cumOfferRev = 0;
    let cumGMV = 0;

    for (let m = 1; m <= months; m++) {
      const paidClicks = Math.round((s.paidBudget * (1 + (m-1)*0.10)) / s.cpc);
      const organicVisits = Math.round(s.organicStart * (1 + (m-1) * s.organicGrowth));
      const sharers = totalUsers * s.shareRate * 0.3;
      const viralImpressions = sharers * s.avgShareReach;
      const viralClicks = Math.round(viralImpressions * s.shareClickRate);
      const giveawayViral = Math.round(totalUsers * 0.15 * 3);
      const totalTraffic = paidClicks + organicVisits + viralClicks + giveawayViral;
      const newSignups = Math.round(totalTraffic * s.signupRate);
      totalUsers += newSignups;
      const offersBought = Math.round(totalUsers * s.offerConvRate);
      const monthGMV = offersBought * s.avgOfferPrice;
      const monthPlatformFee = Math.round(monthGMV * s.avgFeeRate);
      cumGMV += monthGMV;
      cumOfferRev += monthPlatformFee;

      data.push({
        m, paidClicks, organicVisits, viralClicks, giveawayViral,
        totalTraffic, newSignups, totalUsers,
        offersBought, monthGMV, monthPlatformFee, cumGMV, cumOfferRev,
      });
    }
    return data;
  }

  return (
    <div>
      <h2 style={{ color: gold, marginBottom: 4 }}>Traffic & Smart Offer Revenue Projections</h2>
      <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 0 }}>
        Smart Offer revenue ONLY (subscription MRR tracked separately in Internal ROI tab)
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[3,6,12].map(m => (
          <button key={m} onClick={() => setMonth(m)} style={{
            padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer",
            background: month===m ? gold : "#1F2937", color: month===m ? navy : "#9CA3AF",
            fontWeight: 600, fontSize: 12
          }}>{m} Mo</button>
        ))}
      </div>

      {Object.entries(scenarios).map(([key, s]) => {
        const data = project(s, month);
        const last = data[data.length-1];
        return (
          <Card key={key} title={`${s.icon} ${s.label}`} accent={s.color}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              <Badge color={s.color}>Ad spend: ${s.paidBudget.toLocaleString()}/mo</Badge>
              <Badge color={s.color}>CPC: ${s.cpc}</Badge>
              <Badge color={s.color}>{(s.signupRate*100)}% signup</Badge>
              <Badge color={s.color}>{(s.shareRate*100)}% share</Badge>
              <Badge color={s.color}>{s.avgShareReach} reach/share</Badge>
              <Badge color={s.color}>{(s.offerConvRate*100)}% buy offers</Badge>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
              <Stat label="Total Users" value={last.totalUsers.toLocaleString()} color={s.color} />
              <Stat label="Monthly Traffic" value={last.totalTraffic.toLocaleString()} sub={`${last.viralClicks.toLocaleString()} viral`} color={s.color} />
              <Stat label="Offers Sold/mo" value={last.offersBought.toLocaleString()} color={s.color} />
              <Stat label="Monthly GMV" value={`$${last.monthGMV.toLocaleString()}`} sub="gross offer sales" color={orange} />
              <Stat label="PD Smart Offer Rev" value={`$${last.cumOfferRev.toLocaleString()}`} sub={`cumulative (${month}mo)`} color={gold} />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead><tr style={{ background: navy }}>
                  {["Mo","Paid","Organic","Viral","Giveaway","Total Traffic","Signups","Users","Offers","GMV","PD Fee/mo","Cumul Rev"].map(h => (
                    <th key={h} style={{ color: s.color, padding: "5px 3px", fontSize: 9, textAlign: "center", borderBottom: `1px solid ${s.color}44`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{data.map((d, i) => (
                  <tr key={i} style={{ background: i%2?"#1F2937":"#111827" }}>
                    {[`M${d.m}`, d.paidClicks.toLocaleString(), d.organicVisits.toLocaleString(), d.viralClicks.toLocaleString(), d.giveawayViral.toLocaleString(), d.totalTraffic.toLocaleString(), d.newSignups.toLocaleString(), d.totalUsers.toLocaleString(), d.offersBought.toLocaleString(), `$${d.monthGMV.toLocaleString()}`, `$${d.monthPlatformFee.toLocaleString()}`, `$${d.cumOfferRev.toLocaleString()}`].map((c, j) => (
                      <td key={j} style={{ padding: "4px 3px", fontSize: 10, textAlign: "center", color: j===7?s.color:j>=9?gold:"#E5E7EB", fontWeight: j===7||j===11?700:400 }}>{c}</td>
                    ))}
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <div style={{ marginTop: 12, background: "#0A0E1A", padding: 12, borderRadius: 8, border: `1px solid ${s.color}22` }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Viral Sharing Math (Month {month}):</div>
              <div style={{ fontSize: 11, color: "#D1D5DB", lineHeight: 1.7 }}>
                {last.totalUsers.toLocaleString()} users &times; {(s.shareRate*100)}% share rate &times; 30% active this month = <strong style={{ color: "#FFF" }}>{Math.round(last.totalUsers * s.shareRate * 0.3).toLocaleString()} active sharers</strong>
                <br/>&times; {s.avgShareReach} people see each share = <strong style={{ color: "#FFF" }}>{Math.round(last.totalUsers * s.shareRate * 0.3 * s.avgShareReach).toLocaleString()} impressions</strong>
                <br/>&times; {(s.shareClickRate*100)}% click through = <strong style={{ color: s.color }}>{last.viralClicks.toLocaleString()} viral visits (FREE traffic)</strong>
                <br/><span style={{ color: gold }}>+ {last.giveawayViral.toLocaleString()} giveaway viral visits = {(last.viralClicks + last.giveawayViral).toLocaleString()} total organic/viral ({Math.round((last.viralClicks + last.giveawayViral) / last.totalTraffic * 100)}% of traffic is FREE)</span>
              </div>
            </div>
          </Card>
        );
      })}

      <Card title="Why First Movers Win" accent={gold}>
        <div style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 4px" }}>Direct PD-funded paid traffic from Day 1 to their offers</p>
          <p style={{ margin: "0 0 4px" }}>Featured alongside $250 weekly giveaway promotions</p>
          <p style={{ margin: "0 0 4px" }}>Less competition — more visibility before competitors join</p>
          <p style={{ margin: "0 0 4px" }}>Elite category lock — only 3 per category, first come first served</p>
          <p style={{ margin: 0 }}>Points economy early adopters sharing their offers as viral loop ramps</p>
        </div>
      </Card>

      <Card title="Key Insight: The Viral Tipping Point" accent={orange}>
        <div style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 8px" }}>
            The magic happens when viral + giveaway traffic exceeds paid traffic. At that point,
            your <strong style={{ color: gold }}>customer acquisition cost drops toward zero</strong> because
            the community is doing the marketing for you — incentivized by the points system.
          </p>
          <p style={{ margin: 0 }}>
            In the conservative model, viral traffic is {(() => { const d = project(scenarios.conservative, 6); const l = d[d.length-1]; return Math.round((l.viralClicks+l.giveawayViral)/l.totalTraffic*100); })()}% of total at month 6.
            In the aggressive model, it&apos;s {(() => { const d = project(scenarios.aggressive, 6); const l = d[d.length-1]; return Math.round((l.viralClicks+l.giveawayViral)/l.totalTraffic*100); })()}%.
            <strong style={{ color: orange }}> That&apos;s when the flywheel takes over.</strong>
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab 4: Tracking & UTM ──────────────────────────────────
function TrackingUTM() {
  return (
    <div>
      <h2 style={{ color: gold, marginBottom: 4 }}>Tracking & UTM Architecture</h2>
      <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 0 }}>Full UTM on ALL links ALL the time. Params persist across page navigation.</p>
      <Card title="Link Formats" accent={blue}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#E5E7EB", lineHeight: 2.2 }}>
          {[
            { label: "Consumer Referral", url: "platinumdirectorytemeculavalley.com", params: "?ref=USR_a1b2c3", note: "Auto-embedded when logged in. 30-day cookie." },
            { label: "Business Sharing Own Listing", url: ".../business/sunset-winery", params: "?ref=BIZ_w4x5y6", note: "BIZ_ prefix earns business points." },
            { label: "Smart Offer Share", url: ".../offers/wine-tasting", params: "?ref=USR_a1b2c3", note: "5% commission when friend buys." },
            { label: "Affiliate Partner", url: "platinumdirectorytemeculavalley.com", params: "?aff=AFF_x9y8z7", note: "5% recurring on subs + offers." },
            { label: "Full Paid Traffic", url: "platinumdirectorytemeculavalley.com", params: "?ref=BIZ_w4x5y6&utm_source=facebook&utm_medium=paid&utm_campaign=summer_wine&utm_content=carousel_v2", note: "ref/aff + UTM coexist." },
          ].map((link, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ color: gold, fontSize: 12, fontWeight: 700, fontFamily: "sans-serif", marginBottom: 3 }}>{link.label}:</div>
              <div style={{ background: "#000", padding: 8, borderRadius: 6, overflowX: "auto" }}>
                <span style={{ color: "#9CA3AF" }}>{link.url}</span><span style={{ color: green }}>{link.params}</span>
              </div>
              <div style={{ color: "#6B7280", fontSize: 10, fontFamily: "sans-serif", marginTop: 2 }}>{link.note}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="UTM Persistence Flow" accent={purple}>
        <div style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 1.8 }}>
          {[["1. First Touch","Middleware reads URL params \u2192 stores ref, aff, all UTMs in cookies (30-day ref, 365-day visitor ID)"],
            ["2. Page Navigation","Client-side interceptor appends UTM params to ALL internal links. Params follow user everywhere."],
            ["3. Event Firing","Every event includes full UTM context. Fires to GA4, Meta Pixel+CAPI, TikTok Pixel+API, Internal."],
            ["4. Conversion","Full UTM trail recorded. Trace any sale to exact source/medium/campaign/content."]
          ].map(([t,d], i) => (
            <div key={i} style={{ background: "#1e1b4b", padding: 10, borderRadius: 8, marginBottom: 6 }}>
              <strong style={{ color: purple }}>{t}</strong>
              <p style={{ margin: "4px 0 0", fontSize: 11 }}>{d}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Analytics Pixel Stack" accent={blue}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["GTM","Master container","NEXT_PUBLIC_GTM_ID"],["GA4","Full events","NEXT_PUBLIC_GA4_ID"],["Google Ads","Conversions","GOOGLE_CONVERSION_ID"],["Meta Pixel","FB/IG retarget","META_PIXEL_ID"],["Meta CAPI","Server-side","META_CAPI_TOKEN"],["TikTok Pixel","TT retarget","TIKTOK_PIXEL_CODE"],["TikTok API","Server-side","TIKTOK_ACCESS_TOKEN"],["Internal","Our system","Built-in"],["Postmark","Email tracking","Configured"]].map(([n,note,env], i) => (
            <div key={i} style={{ background: "#0A0E1A", padding: 8, borderRadius: 6 }}>
              <div style={{ color: "#FFF", fontSize: 11, fontWeight: 600 }}>{n}</div>
              <div style={{ color: "#6B7280", fontSize: 10 }}>{note}</div>
              <div style={{ color: blue, fontSize: 9, fontFamily: "monospace" }}>{env}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab 5: Share UX (glassmorphism redesign) ───────────────
function ShareUX() {
  const glassBtn = (label: string, icon: string) => ({
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(201,168,76,0.25)",
    padding: "12px 8px",
    borderRadius: 12,
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "all 0.2s",
  });

  return (
    <div>
      <h2 style={{ color: gold, marginBottom: 4 }}>Share UX & Referral Buttons</h2>
      <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 0 }}>BIG share buttons everywhere. Ref code auto-embedded when logged in. Must log in to share.</p>

      <Card title="Business Listing — Share Section (Logged In)" accent={green}>
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
          <div style={{ color: "#FFF", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Share Sunset Winery & Earn Points</div>
          <div style={{ color: "#9CA3AF", fontSize: 11, marginBottom: 12 }}>Earn 25 points every time someone visits through your link</div>
          <div style={{ background: "rgba(0,0,0,0.4)", padding: 10, borderRadius: 10, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#9CA3AF" }}>.../business/sunset-winery<span style={{ color: green }}>?ref=USR_a1b2c3</span></span>
            <span style={{ background: `linear-gradient(135deg, ${gold}, #E8C97A)`, color: navy, padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Copy Link</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { icon: "f", label: "Facebook", glow: "rgba(124,58,237,0.3)" },
              { icon: "\ud83d\udcf7", label: "Instagram", glow: "rgba(201,168,76,0.3)" },
              { icon: "\ud835\udd4f", label: "X / Twitter", glow: "rgba(255,255,255,0.1)" },
              { icon: "\ud83d\udcac", label: "Text / SMS", glow: "rgba(5,150,105,0.3)" },
            ].map((btn) => (
              <div key={btn.label} style={{ ...glassBtn(btn.label, btn.icon), boxShadow: `0 0 20px ${btn.glow}` }}>
                <div style={{ color: "#FFF", fontSize: 14, fontWeight: 600 }}>{btn.icon}</div>
                <div style={{ color: "#E5E7EB", fontSize: 10, marginTop: 4 }}>{btn.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Smart Offer — Share Section (Higher Incentive)" accent={purple}>
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 16, border: "1px solid rgba(124,58,237,0.2)", backdropFilter: "blur(12px)" }}>
          <div style={{ color: "#FFF", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Share This Deal & Earn 5% When They Buy!</div>
          <div style={{ color: green, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>$59 Wine Tasting &rarr; You earn $2.95 per friend who buys</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {["Share on Facebook", "Copy for Instagram", "Post on X", "Send via Text"].map((label) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(124,58,237,0.25)", padding: "12px 8px", borderRadius: 12,
                textAlign: "center", cursor: "pointer",
              }}>
                <div style={{ color: "#FFF", fontSize: 11, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Not Logged In — Registration Gate" accent={red}>
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 16, border: `1px solid ${red}44`, backdropFilter: "blur(12px)" }}>
          <div style={{ color: "#FFF", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Share & Earn Points!</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, opacity: 0.25, pointerEvents: "none" }}>
            {["Facebook","Instagram","X","Text"].map((label) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.06)", padding: "12px 8px", borderRadius: 12,
                textAlign: "center", border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ color: "#FFF", fontSize: 11 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, textAlign: "center" }}>
            <span style={{ background: `linear-gradient(135deg, ${gold}, #E8C97A)`, color: navy, padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14, display: "inline-block" }}>
              Sign Up FREE — Get $5.50 in Points Instantly
            </span>
          </div>
          <div style={{ marginTop: 8, textAlign: "center", color: "#6B7280", fontSize: 10 }}>Buttons disabled until login. Clicking any button opens signup.</div>
        </div>
      </Card>

      <Card title="Share Button Placement" accent={gold}>
        <div style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 1.9 }}>
          {[["Business Detail Page","Full-width section below business info, above reviews"],["Smart Offer Detail","Full-width below offer + above Buy Now button"],["Smart Offer Cards","Share icon on each card in listings"],["Post-Purchase","Confirmation: 'Share & earn 5%' with full share section"],["Homepage (logged in)","'Share PD & earn' CTA with personal ref link"],["Giveaway Page","'Share for extra entries + 1,000 pts/friend'"],["User Dashboard","Your Referral Links with all share URLs + copy buttons"],["Mobile Bottom Bar","Share icon \u2192 native Web Share API with ref link"]].map(([p, d], i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <strong style={{ color: "#FFF", minWidth: 170, fontSize: 11 }}>{p}:</strong>
              <span style={{ color: "#9CA3AF", fontSize: 11 }}>{d}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab 6: Internal ROI ────────────────────────────────────
function InternalROI() {
  const [biz, setBiz] = useState({ v: 20, p: 8, e: 2 });
  const [offers, setOffers] = useState(35);
  const [avgPrice, setAvgPrice] = useState(45);

  const mrrV = biz.v*99, mrrP = biz.p*799, mrrE = biz.e*3500;
  const mrr = mrrV+mrrP+mrrE;
  const setup = biz.v*500+biz.p*1000+biz.e*1500;
  const totalBiz = biz.v+biz.p+biz.e;
  const monthlyOffers = totalBiz*offers;
  const offerGMV = monthlyOffers*avgPrice;
  const blendedFee = totalBiz > 0 ? (biz.v*0.30+biz.p*0.25+biz.e*0.25)/(totalBiz) : 0.27;
  const offerPlatformRev = Math.round(offerGMV*blendedFee);
  const totalMonthly = mrr + offerPlatformRev;

  const costs: Record<string, number> = {Twilio:42,Postmark:25,Supabase:25,Vercel:20,FireCrawl:99,"Google Maps":70,"Weekly Giveaway":1000,"Points Cashout":800,"Paid Ads":2000};
  const totalCosts = Object.values(costs).reduce((a,b)=>a+b,0);
  const profit = totalMonthly - totalCosts;

  return (
    <div>
      <h2 style={{ color: gold, marginBottom: 4 }}>Internal ROI & Projections</h2>
      <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 0 }}>Team only. Subscription MRR + Smart Offer revenue combined.</p>

      <Card title="Adjust Scenario" accent={blue}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {([["Verified ($99)","v",biz.v],["Partner ($799)","p",biz.p],["Elite ($3,500)","e",biz.e]] as [string,string,number][]).map(([l,k,v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ color: "#9CA3AF", fontSize: 10, marginBottom: 4 }}>{l}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <button onClick={() => setBiz(p=>({...p,[k]:Math.max(0,(p as any)[k]-1)}))} style={{ background: "#374151", border: "none", color: "#FFF", width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 14 }}>-</button>
                <span style={{ color: "#FFF", fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: "center" }}>{v}</span>
                <button onClick={() => setBiz(p=>({...p,[k]:(p as any)[k]+1}))} style={{ background: "#374151", border: "none", color: "#FFF", width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 14 }}>+</button>
              </div>
            </div>
          ))}
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#9CA3AF", fontSize: 10, marginBottom: 4 }}>Offers/Biz/Mo</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <button onClick={() => setOffers(p=>Math.max(5,p-5))} style={{ background: "#374151", border: "none", color: "#FFF", width: 22, height: 22, borderRadius: 4, cursor: "pointer" }}>-</button>
              <span style={{ color: "#FFF", fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: "center" }}>{offers}</span>
              <button onClick={() => setOffers(p=>p+5)} style={{ background: "#374151", border: "none", color: "#FFF", width: 22, height: 22, borderRadius: 4, cursor: "pointer" }}>+</button>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#9CA3AF", fontSize: 10, marginBottom: 4 }}>Avg Offer $</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <button onClick={() => setAvgPrice(p=>Math.max(15,p-5))} style={{ background: "#374151", border: "none", color: "#FFF", width: 22, height: 22, borderRadius: 4, cursor: "pointer" }}>-</button>
              <span style={{ color: "#FFF", fontWeight: 700, fontSize: 16, minWidth: 28, textAlign: "center" }}>${avgPrice}</span>
              <button onClick={() => setAvgPrice(p=>p+5)} style={{ background: "#374151", border: "none", color: "#FFF", width: 22, height: 22, borderRadius: 4, cursor: "pointer" }}>+</button>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
        <Stat label="Subscription MRR" value={`$${mrr.toLocaleString()}`} color={blue} />
        <Stat label="Smart Offer Rev" value={`$${offerPlatformRev.toLocaleString()}`} sub={`${monthlyOffers} offers \u00d7 ${Math.round(blendedFee*100)}% avg`} color={green} />
        <Stat label="Total Monthly" value={`$${Math.round(totalMonthly).toLocaleString()}`} color={gold} />
        <Stat label="Projected ARR" value={`$${Math.round(totalMonthly*12).toLocaleString()}`} color={gold} />
        <Stat label="Net Profit" value={`$${Math.round(profit).toLocaleString()}`} color={profit>0?green:red} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Revenue Breakdown" accent={green}>
          <div style={{ fontSize: 12, color: "#D1D5DB", lineHeight: 2 }}>
            <div style={{ color: "#6B7280", fontSize: 10, fontWeight: 600, marginBottom: 4 }}>SUBSCRIPTIONS (RECURRING)</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Verified ({biz.v} &times; $99)</span><span style={{ color: green }}>${mrrV.toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Partner ({biz.p} &times; $799)</span><span style={{ color: green }}>${mrrP.toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Elite ({biz.e} &times; $3,500)</span><span style={{ color: green }}>${mrrE.toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #374151", paddingTop: 4, marginTop: 4 }}><span>Total MRR</span><span style={{ color: blue }}>${mrr.toLocaleString()}</span></div>

            <div style={{ color: "#6B7280", fontSize: 10, fontWeight: 600, marginBottom: 4, marginTop: 12 }}>SMART OFFER FEES (TRANSACTIONAL)</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Offer GMV ({monthlyOffers} &times; ${avgPrice})</span><span>${offerGMV.toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>PD Platform Fee ({Math.round(blendedFee*100)}% avg)</span><span style={{ color: green }}>${offerPlatformRev.toLocaleString()}</span></div>

            <div style={{ color: "#6B7280", fontSize: 10, fontWeight: 600, marginBottom: 4, marginTop: 12 }}>ONE-TIME (NOT IN MONTHLY)</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Setup Fees (when they sign up)</span><span style={{ color: gold }}>${setup.toLocaleString()}</span></div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${gold}`, paddingTop: 6, marginTop: 8, fontWeight: 700 }}>
              <span style={{ color: gold }}>TOTAL MONTHLY (recurring)</span>
              <span style={{ color: gold, fontSize: 16 }}>${Math.round(totalMonthly).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card title="Costs & Profit" accent={red}>
          <div style={{ fontSize: 12, color: "#D1D5DB", lineHeight: 2 }}>
            {Object.entries(costs).map(([k,v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between" }}><span>{k}</span><span style={{ color: red }}>${v.toLocaleString()}</span></div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${red}`, paddingTop: 4, marginTop: 4, fontWeight: 700 }}>
              <span>TOTAL COSTS</span><span style={{ color: red }}>${totalCosts.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${gold}`, paddingTop: 6, marginTop: 8, fontWeight: 700 }}>
              <span style={{ color: profit>0?green:red }}>NET PROFIT</span>
              <span style={{ color: profit>0?green:red, fontSize: 18 }}>${Math.round(profit).toLocaleString()}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: "#6B7280" }}>
              Margin: {totalMonthly > 0 ? Math.round(profit/totalMonthly*100) : 0}% | Break-even: ${totalCosts.toLocaleString()}/mo
            </div>
          </div>
        </Card>
      </div>

      <Card title="Milestones" accent={gold}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {([["Break Even",`$${totalCosts.toLocaleString()}/mo`,"~5 Verified + 2 Partner",blue],["$10K MRR","$10,000/mo subs","~8 Partner + 1 Elite",purple],["$25K Monthly","$25K total rev","~20 paid + offers flowing",green],["$50K Monthly","$50K total rev","~40 paid + viral loop",gold],["$100K ARR","$8,333/mo","6-month target",orange],["$500K ARR","$41,667/mo","12-18 month target",gold]] as [string,string,string,string][]).map(([t,m,w,c], i) => (
            <div key={i} style={{ background: "#0A0E1A", padding: 12, borderRadius: 8, border: `1px solid ${c}33`, textAlign: "center" }}>
              <div style={{ color: c, fontWeight: 700, fontSize: 14 }}>{t}</div>
              <div style={{ color: "#E5E7EB", fontSize: 11, marginTop: 2 }}>{m}</div>
              <div style={{ color: "#6B7280", fontSize: 10, marginTop: 2 }}>{w}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab 7: Payment Methods (stablecoins update) ───────────
function PaymentMethods() {
  return (
    <div>
      <h2 style={{ color: gold, marginBottom: 4 }}>Payment Methods & Checkout</h2>
      <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 0 }}>Every way to push money through our system via Stripe</p>

      <Card title="Stripe Payment Methods — All Available" accent={blue}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { name: "Credit/Debit Cards", status: "Live", desc: "Visa, Mastercard, Amex, Discover", color: green },
            { name: "Apple Pay", status: "Live", desc: "One-tap checkout on iOS/Safari", color: green },
            { name: "Google Pay", status: "Live", desc: "One-tap on Android/Chrome", color: green },
            { name: "Link by Stripe", status: "Live", desc: "Save payment info, one-click checkout", color: green },
            { name: "PayPal", status: "Enable", desc: "Stripe PayPal integration — huge reach", color: blue },
            { name: "Venmo", status: "Enable", desc: "Via PayPal integration, popular with younger demo", color: blue },
            { name: "Cash App Pay", status: "Enable", desc: "Square's Cash App via Stripe", color: blue },
            { name: "Affirm", status: "Enable", desc: "Buy now, pay later — 4 installments", color: purple },
            { name: "Klarna", status: "Enable", desc: "BNPL — pay in 4, pay in 30 days", color: purple },
            { name: "Afterpay", status: "Enable", desc: "BNPL — 4 interest-free payments", color: purple },
            { name: "Stablecoins (USDT/USDC)", status: "Enable", desc: "Primary crypto option — pegged to USD, no market volatility. Instant settlement.", color: orange },
            { name: "Bitcoin (BTC)", status: "Optional", desc: "Secondary crypto option via Stripe. Subject to market volatility.", color: orange },
            { name: "ACH Direct Debit", status: "Enable", desc: "Bank transfers — lower fees for subscriptions", color: blue },
          ].map((pm, i) => (
            <div key={i} style={{ background: "#0A0E1A", padding: 12, borderRadius: 8, border: `1px solid ${pm.color}33` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <strong style={{ color: "#FFF", fontSize: 12 }}>{pm.name}</strong>
                <Badge color={pm.color}>{pm.status}</Badge>
              </div>
              <div style={{ color: "#9CA3AF", fontSize: 10 }}>{pm.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Why This Matters for Smart Offers" accent={gold}>
        <div style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 8px" }}><strong style={{ color: "#FFF" }}>Every payment method we add reduces checkout friction:</strong></p>
          <p style={{ margin: "0 0 6px" }}><strong style={{ color: green }}>BNPL (Affirm/Klarna/Afterpay)</strong> — Customers buy higher-priced offers. A $200 wine club package becomes &ldquo;4 payments of $50.&rdquo; Increases average order value 20-30%.</p>
          <p style={{ margin: "0 0 6px" }}><strong style={{ color: blue }}>PayPal/Venmo/CashApp</strong> — Captures people who don&apos;t have their card handy. Huge for mobile impulse buys. &ldquo;See a deal on Instagram &rarr; tap &rarr; PayPal &rarr; done.&rdquo;</p>
          <p style={{ margin: "0 0 6px" }}><strong style={{ color: orange }}>Stablecoins (USDT/USDC)</strong> — No market volatility unlike BTC/ETH. 1 USDC = $1 always. Instant settlement, lower fees. Differentiator: &ldquo;First local directory accepting stablecoins.&rdquo;</p>
          <p style={{ margin: "0 0 6px" }}><strong style={{ color: blue }}>ACH</strong> — For business subscriptions. Lower Stripe fees (0.80% vs 2.9%) on recurring payments. Partner at $799/mo saves ~$16/mo in processing fees.</p>
          <p style={{ margin: 0, color: gold }}>All of these are toggles in Stripe Dashboard &rarr; Settings &rarr; Payment Methods. No code changes needed — Stripe Checkout automatically shows enabled methods.</p>
        </div>
      </Card>

      <Card title="Points Wallet + Payment Methods = Combo Checkout" accent={purple}>
        <div style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 8px" }}><strong style={{ color: "#FFF" }}>At checkout, the customer sees:</strong></p>
          <div style={{ background: "#0A0E1A", padding: 16, borderRadius: 8, border: "1px dashed #374151" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFF", marginBottom: 8 }}>Wine Tasting Experience — $59.00</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
              <span>Points discount (5,500 pts)</span><span style={{ color: green }}>-$5.50</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, fontWeight: 700, borderTop: "1px solid #374151", paddingTop: 8 }}>
              <span>You pay</span><span style={{ color: gold }}>$53.50</span>
            </div>
            <div style={{ color: "#6B7280", fontSize: 11, marginBottom: 4 }}>Pay with:</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["\ud83d\udcb3 Card","\ud83c\udf4e Apple Pay","\ud83d\udcf1 Google Pay","\ud83c\udd7f\ufe0f PayPal","\ud83d\udc9c Klarna","\ud83d\udcb2 USDC"].map(m => (
                <span key={m} style={{ background: "#1F2937", padding: "4px 10px", borderRadius: 4, fontSize: 10, color: "#E5E7EB" }}>{m}</span>
              ))}
            </div>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 11, color: "#9CA3AF" }}>
            Points reduce the charge amount. Remaining balance paid via any enabled Stripe method.
            If points cover the full amount, no payment method needed — 100% points redemption.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function RevenueArchitecturePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("pd_revenue_auth") === "1") {
      setAuthenticated(true);
    }
  }, []);

  if (!authenticated) {
    return <PasswordGate onUnlock={() => setAuthenticated(true)} />;
  }

  const TabContent = [FeeStructure, PointsStructure, TrafficProjections, TrackingUTM, ShareUX, InternalROI, PaymentMethods][tab];

  return (
    <div style={{ background: "#030712", minHeight: "100vh", padding: "20px 16px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <h1 style={{ color: gold, fontSize: 22, fontWeight: 800, marginBottom: 4, marginTop: 0 }}>PLATINUM DIRECTORY — Revenue Architecture</h1>
        <p style={{ color: "#6B7280", fontSize: 13, marginTop: 0, marginBottom: 16, letterSpacing: 1 }}>
          CONFIDENTIAL &bull; Internal Team Only &bull; Updated February 2026
        </p>
        <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {tabList.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: tab===i ? gold : "#1F2937", color: tab===i ? navy : "#9CA3AF",
              fontWeight: 600, fontSize: 11, whiteSpace: "nowrap"
            }}>{t}</button>
          ))}
        </div>
        <TabContent />
        <div style={{ marginTop: 24, padding: "12px 16px", background: "#111827", borderRadius: 8, textAlign: "center" }}>
          <span style={{ color: "#6B7280", fontSize: 11 }}>Platinum Directory Temecula Valley | Confidential Internal Document</span>
        </div>
      </div>
    </div>
  );
}
