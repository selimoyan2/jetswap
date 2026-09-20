# JetSwap Sprint 11 — JetTrust V1

## AI AGENT TASK

Implement Sprint 11 only.

Sprint 11 introduces the first deterministic, explainable JetTrust reputation engine.

JetTrust is NOT the same as review rating.

Existing:
```text
User.rating
User.reviewCount
```
represent user review reputation.

New:
```text
JetTrust
```
represents broader platform trust.

Core principle:
```text
JetTrust = deterministic trust score derived from real platform data
```

Do NOT use AI/LLM scoring.
Do NOT manually assign arbitrary trust scores from frontend.
Do NOT implement notifications, disputes, payments, escrow, shipping integrations, moderation automation, Swap Chains, or Sprint 12 features.

---

# OBJECTIVE

Implement:
```text
JetTrust V1
0–100
```
based only on trustworthy data already available in JetSwap.

The score must be:
```text
deterministic
explainable
server-calculated
bounded 0–100
hard to manipulate
backward compatible
```

---

# JETTRUST V1 DATA SOURCES

V1 score consists of:
```text
Account Foundation      0–15
Profile Completeness    0–10
Completed Trades        0–35
Review Reputation       0–30
Trade Reliability       0–10
--------------------------------
TOTAL                   0–100
```

---

# 1. ACCOUNT FOUNDATION — MAX 15
```text
< 7 days        = 2
7–29 days       = 5
30–89 days      = 8
90–179 days     = 11
180+ days       = 15
```

---

# 2. PROFILE COMPLETENESS — MAX 10
```text
name present        +1
email present       +2
phone present       +2
avatar present      +2
bio present         +1
country present     +1
city present        +1
```

---

# 3. COMPLETED TRADES — MAX 35
```text
0 completed trades     = 0
1                      = 10
2                      = 16
3–4                    = 22
5–7                    = 27
8–14                   = 31
15+                    = 35
```

---

# 4. REVIEW REPUTATION — MAX 30
Quality component (max 22) + Confidence component (max 8)

Quality:
```text
average < 2.0     = 0
2.0–2.49          = 4
2.5–2.99          = 8
3.0–3.49          = 12
3.5–3.99          = 16
4.0–4.49          = 19
4.5–5.0           = 22
```

Confidence:
```text
0 reviews          = 0
1                  = 2
2                  = 3
3–4                = 5
5–9                = 7
10+                = 8
```

---

# 5. TRADE RELIABILITY — MAX 10
If `completedCount + cancelledCount === 0`: score = 5 (neutral baseline)
Otherwise:
```text
completionRatio = completedCount / (completedCount + cancelledCount)
>= 0.90       = 10
>= 0.75       = 8
>= 0.60       = 6
>= 0.40       = 4
< 0.40        = 2
```

---

# JETTRUST LEVELS
```text
0–29     NEW (Yeni)
30–49    DEVELOPING (Gelişiyor)
50–69    ESTABLISHED (Yerleşik)
70–84    TRUSTED (Güvenilir)
85–100   HIGH_TRUST (Yüksek Güven)
```
