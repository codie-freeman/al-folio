---
layout: page
title: Inverse Gas Chromatography
description: A lightweight, reproducible toolkit for parsing, analysing, and visualising Inverse Gas Chromatography (IGC) surface energy data.
img: /assets/img/igc-drawer.jpg
importance: 3
---

## Links
[GitHub — inverse-gas-chromatography](https://github.com/codie-freeman/inverse-gas-chromatography)

---

## At a glance
- **Outcome:** Functional toolkit for parsing IGC instrument exports and computing surface energy components
- **Tools:** Python, Jupyter, Cirrus Plus v1.5 (validation reference)
- **Skills:** scientific software development, data parsing, reproducible computation, AI-assisted development
- **Result highlight:** calculations validated against Cirrus Plus v1.5 outputs; notebook prototypes available in the repository

---

## Overview
**Can IGC surface energy data be extracted, calculated, and visualised in a transparent, reproducible way outside of proprietary software?**
Cirrus Plus handles this well but operates as a black box. This toolkit reimplements the core calculations openly, so results can be inspected, reproduced, and extended.

---

## Objectives
- Build a reliable parser for multi‑table CSV exports from IGC instruments
- Implement core surface energy calculations in a transparent, reproducible way
- Provide clear visualisations (e.g., γsD, γsAB, acid/base components, isotherms)
- Offer a simple interface for uploading CSVs and generating graphs
- Maintain honest documentation of the development process, including AI‑assisted steps
- Produce a user‑friendly tool suitable for early‑career researchers

---

## Scope
**Data handled:** multi-table CSV exports from IGC-SEA instruments
**Calculations:** dispersive surface energy (γsD), acid/base components (γsAB), total surface energy, adsorption isotherms

---

## Approach
- Developed a CSV parser to handle the irregular multi-table format exported by IGC instruments
- Reimplemented surface energy calculations from the IGC-SEA methodology literature
- Validated outputs against Cirrus Plus v1.5 reference calculations
- Built Jupyter notebook prototypes to demonstrate parsing, calculation, and visualisation

---

## Results
- Parser successfully extracts retention data from instrument CSV exports
- Calculated γsD, γsAB, and acid/base components match Cirrus Plus v1.5 outputs
- Notebook prototypes produce plots for dispersive energy, isotherms, and component breakdown

---

## Interpretation
**What worked well**
- Validation against Cirrus Plus confirmed calculation accuracy
- Jupyter notebook format makes each step transparent and reproducible
- AI-assisted development accelerated prototyping without compromising scientific accuracy

**Limitations**
- Currently prototype-level; not packaged for general distribution
- Parser handles one instrument export format; other formats would need extension

---

## Improvements
- Package into a proper Python library with a CLI or lightweight web interface
- Extend parser to handle additional instrument export formats
- Add uncertainty propagation to surface energy outputs

---

## What I learned
- Practical experience structuring a scientific Python project
- Working with messy, instrument-exported CSV formats
- Using AI-assisted development responsibly within a technical domain
- How to validate computational outputs against reference software
