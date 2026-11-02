---
layout: page
title: igcsea
description: An open-source Python package for calculating surface energy from inverse gas chromatography data, validated against the vendor software and built so every step of the calculation can be inspected.
img: /assets/img/igc-drawer.jpg
importance: 2
---

[GitHub: inverse-gas-chromatography](https://github.com/codie-freeman/inverse-gas-chromatography)

igcsea is a Python package that takes the raw CSV export from a Surface Measurement Systems iGC-SEA and calculates dispersive and specific surface energy, acid-base components and adsorption isotherms. I wrote it during my placement at Resolian, where I was running the instrument daily, and have kept developing it since.

## Why I built it

The instrument ships with Cirrus Plus, which does the surface energy calculation well but as a black box. You cannot see the intermediate values, you cannot change which method is applied, and some parameters are simply not exposed. During the sucrose study I needed Dorris-Gray and Della Volpe parameters that the vendor software would not give me, so I processed the raw exports myself in Python and cross-checked the results against what Cirrus Plus did report. That script became the package.

The point is not to replace the vendor software. It is to have an open implementation of the same calculations that can be read, tested, reproduced and extended, and that early-career analysts can use to understand what the instrument is actually doing to their data.

## What it does

- Parses the irregular multi-table CSV format the instrument exports, which mixes metadata, retention data and derived values in a single file
- Calculates dispersive surface energy (γsᴰ) using the Dorris-Gray method
- Calculates the specific component (γsᴬᴮ) and acid-base character using the Della Volpe approach
- Builds adsorption isotherms and surface energy heterogeneity profiles across fractional surface coverage
- Plots dispersive energy, isotherms and the component breakdown

## Validation

Every calculated quantity has been checked against Cirrus Plus v1.5 output on the same data files. The package is covered by 43 tests across its six modules, so a change that breaks the agreement with the reference software fails the test suite rather than quietly producing a different number.

## How it was built

I used Claude Code as the primary coding tool for this project, and I say so in the repository. The division of labour was deliberate: I made the scientific decisions, which equations to implement, how to interpret them from the IGC literature, how to handle the instrument's export format and what the outputs should look like, and used the AI to write and refactor the code against those decisions. Validation against Cirrus Plus was the check that the division held.

## Limitations and what's next

The parser handles one instrument's export format. Other IGC instruments would need their own parser, and the package has not yet been tested on them. The calculations do not currently propagate uncertainty through to the surface energy outputs, which is the main thing I want to add, because the heterogeneity profiles in particular would benefit from error bars.