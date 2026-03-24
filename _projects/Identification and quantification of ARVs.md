---
layout: page
title: Identification & Quantification of Antiretroviral Drugs using HPLC‑MS
description: Identification and quantification of antiretroviral drugs in an unknown sample using HPLC‑MS.
img: /assets/img/arv-hplc-ms-cover.png
importance: 2
---

## Links
[Full PDF report]({{ "/assets/pdf/ARV-HPLC-MS-REPORT.pdf" | relative_url }})

---

## At a glance
- **Outcome:** Identified ARVs in an unknown sample + quantified those above LOQ
- **Tools:** Agilent 1100 HPLC + Thermo LTQ Orbitrap XL (ESI+)
- **Skills:** calibration models, residual/error analysis, LOQ/LOD reasoning
- **Result highlight:** two analytes were quantifiable, but concentrations suggested a likely prep/dilution issue rather than method failure

---

## Overview
**Can HPLC‑MS reliably identify and quantify antiretroviral drugs (ARVs) in a simulated biological matrix?**
I built calibration curves (1–100 µg mL⁻¹), tested an "unknown" sample (MK‑U), then assessed performance using residuals and quantification limits.

---

## Objectives
- Prepare calibration standards for five ARV drugs
- Generate linear calibration curves (1–100 µg mL⁻¹)
- Analyse an unknown sample (MK‑U)
- Identify analytes using retention time
- Quantify detected drugs using regression models
- Evaluate method performance (LOD/LOQ, residuals, systematic error)

---

## Scope
**ARVs included:**

`Efavirenz`  `Emtricitabine`  `Lopinavir`  `Ritonavir`  `Tenofovir disoproxil fumarate (TDF)`

---

## Approach
- Prepared standards by serial dilution
- Ran samples on **HPLC‑MS (ESI+, Orbitrap)**
- Used **adjusted peak area vs concentration** to build linear models
- Checked residuals for bias and assessed **LOQ/LOD suitability**

---

## Results

### 1) Calibration performance
**Overall:** strong linearity across all ARVs.

- **R² range:** 0.954–0.996
- **Residuals:** slight systematic error visible
- **Low end (1 µg mL⁻¹):** high relative error (consistent with LLOQ limitations)

> **Takeaway:** calibration was good enough for identification and quantification *within range*, but lowest points carried larger uncertainty.

---

### 2) Unknown sample (MK‑U): what was detected?
Detected:
  **`Lopinavir`**
  **`Ritonavir`**
  **`Emtricitabine`**
  **`TDF`**

Not detected: `Efavirenz`

---

### 3) Quantification (above LOQ)
Only Lopinavir and Ritonavir exceeded LOQ thresholds:

| Analyte | Concentration (µg mL⁻¹) | Note |
|---|---:|---|
| Lopinavir | **143.7** | above calibration range |
| Ritonavir | **310.6** | above calibration range |

> **Interpretation:** both values were **outside the validated range (1–100 µg mL⁻¹)**, strongly suggesting a dilution/preparation issue for MK‑U rather than instrument/method failure.

---

## Interpretation
**What worked well**
- High sensitivity and clear response across the calibration range
- Reliable identification of ARVs in a simulated biological matrix
- Residual analysis provided useful diagnostics (bias vs random error)

**What likely went wrong**
- MK‑U concentrations were implausibly high and beyond the calibration range → most consistent with **prep/dilution error**

---

## Improvements
- Replicate injections to reduce uncertainty
- Internal standards to improve quantitative robustness
- Direct dilutions from stock solutions to reduce compounding error

---

## What I learned
- Practical experience with HPLC‑MS instrumentation
- Building calibration curves + regression interpretation
- Distinguishing systematic vs random error using residuals
- Applying LOQ/LOD logic to real data
- Communicating results clearly for non-specialists
