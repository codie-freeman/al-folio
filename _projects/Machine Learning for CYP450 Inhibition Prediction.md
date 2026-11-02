---
layout: page
title: Machine Learning for CYP450 Inhibition Prediction
description: My final-year project, entered in the OpenADMET CYP450 blind challenge. A model comparison under a frozen statistical protocol, and a record of how often a cross-validated improvement failed to survive contact with held-out data.
img: /assets/img/cyp450.png
importance: 0
---

**Status:** live. The challenge closes on 3 November 2026. The leaderboard scores half the blind set as submissions come in, with the full set scored at the close, so every figure below is provisional. The working notes are on the [blog](/blog/).

[GitHub](https://github.com/codie-freeman/OpenADMET-CYP-Blind-Challenge)

This is my final-year project at the University of Reading, supervised by Dr Mauricio Cafiero, and the basis of my dissertation. It started in August 2026 when the OpenADMET CYP450 challenge opened.

## The problem

Cytochrome P450 enzymes metabolise most small-molecule drugs. A compound that inhibits one of them can raise the plasma concentration of another drug taken at the same time, which is one of the main causes of clinically significant drug-drug interactions, and a reason candidates fail late. Predicting CYP inhibition from structure early, before anything is synthesised, is therefore worth a lot, and it is a problem with plenty of public data and plenty of published models claiming good performance.

The challenge asks entrants to predict pIC50 against four isoforms (CYP1A2, CYP2C9, CYP2D6 and CYP3A4) for 750 compounds whose labels are withheld, from a training set of 4,905 compounds carrying 6,525 dose-response measurements. I entered the direct-inhibition regression track only. The test set being blind is the point: it removes the possibility of tuning to the benchmark, which is exactly the failure mode the project turned out to be about.

## The entry

The pipeline is Python, RDKit and scikit-learn. Three families of model are compared: tree ensembles on fingerprints and descriptors, a message-passing graph neural network (Chemprop), and that network initialised from a pretrained molecular foundation model (CheMeleon), trained multitask across all four isoforms so that one shared encoder learns from every measurement rather than each isoform learning alone.

Comparison follows the protocol Ash et al. set out for method comparison in small-molecule drug discovery: 5x5 repeated cross-validation, twenty-five folds, every model on an identical frozen partition, with variance homogeneity measured rather than assumed and multiplicity corrected. Fold assignment is made once at the compound level and held fixed across isoforms, which matters for a multitask model, since a compound in the training fold for one isoform and the held-out fold for another would otherwise let the model see it anyway. Curation is InChIKey-based and confirms zero overlap between the training set and the blind 750.

Adoption decisions are gated on an effect-size threshold frozen before results are read, derived from how well the design resolves any difference rather than from the comparison under test. Several results that were statistically significant did not clear it and were not adopted.

## What it found

The central result is a negative one, and it is the reason the project is worth writing up rather than merely scoring.

On six separate occasions a model change was confirmed by cross-validation and then failed to improve the blind score. Each carried stronger evidence than the last: a single selection pass, then a single fold, then a full twenty-five-fold confirmation with corrected paired tests, then an ensemble that was material on both accuracy and ranking against a threshold frozen before the comparison existed. The last of those removes the easy explanation. The effect was not marginal; it was measured, pre-registered, and it still delivered nothing.

What did work was calibration rather than modelling. Predictions were systematically narrower than the population being scored, and correcting that is a rank-preserving transform, so its effect can be isolated. One submission changed that single variable with five predictions recorded in advance. All five were confirmed, and the gain is attributable to the correction alone. That is a controlled experiment run on a live blind benchmark, which is unusual, and it was only possible because repeated submissions had first established that the scoring is reproducible to the digit.

A second strand tested whether quantum-chemical descriptors carry information that cheap 2D descriptors do not. Every compound went through a geometry optimisation and a DFT single point: 11,310 jobs, 281 core-hours, no failures. Three independent routes were tried, as linear features, as an ensemble member, and inside the graph network itself. All three came back null, and in two of them the deciding evidence was a control added almost as an afterthought. The run also produced a finding nobody was testing for, where two halves of a descriptor block had opposite-signed effects that cancelled, so testing the block as one unit measured an absence that was not there.

## Where it sits

The project builds on the OpenADMET reference implementations, on Ash et al.'s comparison protocol, and on the public write-ups of entrants to this challenge and the preceding PXR one, several of whom published their methods openly while competing. It is also the reason for the self-directed machine learning study on this blog, which I started in summer 2026 as preparation.