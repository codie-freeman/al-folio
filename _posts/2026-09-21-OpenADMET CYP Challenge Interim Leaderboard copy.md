---
layout: post
title: "Model report: the interim submission"
date: 2026-09-21
description: What the current best submission is, per isoform, separated into what improved ranking and what improved placement, with a pre-registered prediction for the full-set reveal.
tags: cheminformatics machine-learning admet python pharmaceutical-science
categories: dissertation
---

A reference post for the intermediate leaderboard checkpoint on 24 September.<sup>1</sup> Eleven submissions condensed into what the model is, what the record shows and what the reveal will test.

Two different kinds of change have been made over those eleven submissions and they aren't judged on the same metric.

**Model changes** alter which compounds the model thinks are more potent. They show up in board Spearman and Kendall. Nothing else moves these numbers.

**Post-hoc corrections** alter where a whole prediction column sits on the axis and how wide it is. They are affine, so they cannot reorder anything. They show up in ST-RAE, MAE and R², and leave Spearman and Kendall fixed by construction.

Conflating the two is the easiest way to misread this leaderboard. CYP2D6's R² went from −0.59 to +0.41 across three submissions without a single prediction changing rank, which is this project's clearest demonstration that a poor leaderboard score can be explained by a badly placed model.

Every figure below is a half-set measurement: the live board scores half the blind test set, split by chemical series and the full set is scored only at the reveal and at the close on 3 November.

## The result

Best submission to date, `27b`, submitted 2026-09-19:

| | Macro | CYP1A2 | CYP2C9 | CYP2D6 | CYP3A4 |
|---|---:|---:|---:|---:|---:|
| **ST-RAE** | **0.5982** | 0.6954 | 0.5375 | 0.7165 | 0.4434 |
| MAE | 0.7206 | 0.9385 | 0.5280 | 0.8975 | 0.5183 |
| R² | 0.4835 | 0.3073 | 0.5432 | 0.4124 | 0.6709 |
| Spearman | 0.7002 | 0.7375 | 0.7585 | 0.4872 | 0.8177 |

Lower ST-RAE is better; a constant predictor scores exactly 1.0 by construction. Best macro ST-RAE, R², Spearman and Kendall of any submission this project has made, from 0.7179 on the first.

![Macro ST-RAE across submissions, annotated with what changed each time](/assets/img/posts/submission_trajectory.png)
*Macro ST-RAE across the first seven submissions. Filled circles changed the model; open diamonds changed only a post-hoc correction. Every improvement is a diamond. The four submissions since follow the same shape: two model changes that lost on ST-RAE, one correction that produced the result above.*

## What the submission actually is

Not one model. Each isoform's column comes from whichever recipe holds that isoform's best real board result.

| Isoform | Column | Correction |
|---|---|---|
| CYP1A2 | Single CheMeleon-initialised multitask Chemprop, full-data retrain | none |
| CYP2C9 | Capped Caruana-weighted ensemble | none |
| CYP2D6 | The same Chemprop architecture plus four AID 1851 auxiliary heads | placement, then spread |
| CYP3A4 | Single CheMeleon-initialised multitask Chemprop, full-data retrain | none |

The base model throughout is a directed message-passing neural network<sup>2,3</sup> initialised from the CheMeleon foundation checkpoint,<sup>4</sup> trained multitask across all four isoforms under a masked loss, since 73% of compounds carry a label for exactly one enzyme.

Three columns are raw model outputs whilst CYP2D6 carries an offset landing it on a blind population mean solved from the board's own published metrics, then a spread scale widening it to 0.85 of the training-label standard deviation.

## Model changes: what improved ranking

Board Spearman per isoform, across every model this project has submitted. Only a model change can move these numbers, so this is the honest record of whether any modelling work paid off.

| Isoform | Plain model | Caruana ensemble | + AID 1851 | + AID and dead-zone | Best |
|---|---:|---:|---:|---:|---|
| CYP1A2 | 0.7375 | 0.7389 | 0.7466 | **0.7565** | dead-zone + AID |
| CYP2C9 | 0.7389 | **0.7585** | 0.7333 | 0.7554 | Caruana ensemble |
| CYP2D6 | 0.4000 | 0.3771 | **0.4872** | 0.4438 | AID 1851 |
| CYP3A4 | **0.8177** | 0.7706 | 0.7651 | 0.8020 | plain model |

**External data is the only change that improved blind ranking on the most difficult isoform.** CYP2D6's rank correlation sat at 0.40 across five submissions, two ensembling methods and three calibration mechanisms. Adding 16,459 compounds from PubChem AID 1851, an NCATS quantitative high-throughput cytochrome panel covering 17,143 compounds against five isozymes,<sup>5,6</sup> as auxiliary prediction heads moved it to 0.4872 and that gain is in the current submission. Every internal lever tried before left it ranking flat or worse.

**The submission is not on the best-ranked column for CYP1A2.** The dead-zone model ranks CYP1A2 better than the plain model, 0.7565 against 0.7375, and scored worse on ST-RAE, 0.7906 against 0.6954. That is a placement problem and likely has some unexploited headroom.

## Corrections: what improved placement

One metric throughout, CYP2D6's board ST-RAE, with Spearman alongside to show that no correction touched the ranking.

| Change | CYP2D6 ST-RAE | Spearman |
|---|---:|---:|
| Uncorrected plain model | 1.1673 | 0.4000 |
| Recentred on the solved blind population | 0.8299 | 0.4000 |
| Spread widened to 0.85 of training SD | 0.7858 | 0.4000 |
| Same two corrections on the AID model | **0.7165** | 0.4872 |

Spearman moves exactly once, on the row where the model changed. The improvement from 1.1673 to 0.7858 was produced entirely by arithmetic on predictions already made.

![CYP2D6 R² and Spearman across submissions](/assets/img/posts/cyp2d6_placement_vs_ranking.png)
*CYP2D6's R² (top) and Spearman (bottom) across the first seven submissions. R² crosses zero when recentring is applied; Spearman barely moves. The Spearman axis is fixed to 0 to 1 rather than autoscaled, so its flatness is shown honestly.*

The ordering was always roughly right and the whole column sat in the wrong place on the axis.

![CYP2D6 predictions before and after recentring, against the solved blind population](/assets/img/posts/cyp2d6_placement_shift.png)
*The raw prediction column (grey) and the recentred one (red), with the solved blind population as a dashed Normal curve. The correction moves the column 1.35 log units.*

The second lever is spread. Models trained on this data compress toward the mean, under-prediction costs 1.65 to 2.79 times more than over-prediction under this metric and compression is measurable against the real board rather than only out of fold. Another entrant, running under the name 450 nm, publishes a per-isoform table on their own operating dashboard showing their board ST-RAE rank ordered by exactly that.<sup>7</sup>

![Spread ratio against board ST-RAE](/assets/img/posts/spread_ratio_vs_board_strae.png)
*Prediction spread relative to training-label spread against board ST-RAE. Coloured points are this project's submissions; crosses are an external entrant's. Pooled Spearman −0.822.*

## What the correction method actually is

It is leaderboard probing and should be called that.

The method is not mine. It comes from SuperCowPowers' working notes on this challenge, which decompose R² into a correlation term, a spread-ratio term and a bias term, and use an affine fit to recalibrate where predictions sit.<sup>8</sup> I first applied the decomposition against this project's own training population, where the scale and bias terms accounted for almost nothing. Applied against the blind population, the same algebra gives the population directly: a submission's own prediction mean and standard deviation are known exactly, so with its published R² and MAE the blind mean and spread follow as two equations in two unknowns. The CYP2D6 corrections in this submission are that approach applied to this project's own board results, nothing more.

That information comes from the test labels. It reaches me through the published metrics rather than through the labels themselves, but that is a difference of route, not of kind. None of it generalises to a setting where no leaderboard is answering.

Three risks follow, in order of how much they worry me.

**The board scores half the blind set, split by chemical series.** Every solved moment and the 0.85 spread scale are fitted to that half. If the halves differ in composition and a split by chemical series is designed to make them differ, the corrections are tuned to a population that is not the one scored at the reveal. The 1.35 log unit CYP2D6 offset is the most exposed single number in the submission.

**Per-isoform selection across eleven board readings carries no multiple-comparison correction.** The current recipe picks, for each isoform, whichever of eleven submissions scored best on that isoform. Every cross-validation comparison in this project is Benjamini-Hochberg corrected.<sup>9</sup> On the board side there is no correction at all and that selection is the whole recipe.

**The sign of the offset is not recoverable from the algebra.** R² and MAE depend on the bias only through its magnitude, so every solution has a mirror image producing identical metrics. CYP2D6's resolution rests on a convention adopted from an external precedent<sup>8</sup> plus a convergence check not a derivation.

## What did not work

Board rows are blind evidence; CV rows are not, and are marked as such.

| Approach | Tested on | Result | Why |
|---|---|---|---|
| Ensembling: simple averages, capped Caruana<sup>10</sup> | Board, twice | Macro 0.8299 both times, against 0.7138 | Error correlations of 0.79 to 0.91: the members get the same compounds wrong. Kept for CYP2C9 only, where it gave the best rank on record (0.7585) |
| Calibration toward AID 1851 population moments | Board | Macro 0.8811 | Worse on every isoform. Only calibration toward the blind population has helped |
| Dead-zone target on the AID model | Board | Macro 0.6488 | CYP2D6 worse on both ranking and placement like for like (ST-RAE 0.7502 vs 0.7165, Spearman 0.4438 vs 0.4872). Raw columns all worse than the plain model's. Improved CYP1A2 ranking only |
| Non-negative stacking | CV only | Beat best single config out of fold | Never submitted. The coefficient cancellation diagnosed elsewhere<sup>11</sup> is absent from this pool |
| Butina and analog-holdout splits | CV | Inconclusive; analog holdout widened the CV-to-blind gap 2.3 to 9.3× | A split mimicking blind-set construction made the gap larger, not smaller |
| Net charge at pH 7.4<sup>12</sup> as a descriptor | CV | Tied on all four isoforms | Real correlation with pIC50, but error correlation against baseline 0.984 to 0.990 |
| Inverse-density sample weighting | CV | Significantly worse, both configs | Starved the dense middle where most compounds sit |
| Interval-aware training objective | CV | 0.06 to 0.12 log unit gap | Real, too small to justify a custom loss |
| Retrieved near-neighbour corpus | Not built | Closed off | Hard compounds are not structurally distant from training on any isoform |

The claim that four cross-validated results failed to transfer compares raw board ST-RAE, which confounds ranking with placement. On ranking, the AID result did transfer, on the isoform it was predicted to help; what failed was its ST-RAE, because the better-ranked model was also more compressed. Two of the four failed on both ranking and placement. The broader pattern is not peculiar to this project: independent re-evaluations of published ADMET models on held-out data report the same at field scale.<sup>13</sup>


## A pre-registered prediction for the reveal

Recorded before the full set is scored, so the gap can be read as a measure of board overfit rather than explained after the fact.

The three uncorrected columns should transfer roughly intact. CYP2D6's corrections are the exposed part. If they carry to the unseen half, the full-set macro lands near the half-set 0.5982. If they fail completely and CYP2D6 reverts on the unseen half toward its uncorrected 1.3168, its full-set value lands near 1.02 and macro near 0.673.

**Point prediction: macro ST-RAE 0.64, with 0.60 to 0.68 covering the plausible range.**

The diagnostic is CYP2D6 specifically, not the macro. If its full-set ST-RAE comes back above about 1.0, the population solve did not generalise across the series split, and every corrected submission on this project is worth less than its half-set score suggested. If it comes back near 0.72, the solve found a real population property rather than a property of half of one.

## Summary

Ranking improved once, on CYP2D6, and only when compounds from outside the challenge entered the training pool. Every internal rearrangement left it flat or worse.

Placement improved three times, all by arithmetic on predictions already made, worth 0.45 ST-RAE on CYP2D6 alone and most of the project's macro improvement.

The reveal tests placement much harder than ranking. Ranking is a property of the model and should survive a change of scoring population. Placement, here, is a property of half a leaderboard.

---

## References

1. *OpenADMET CYP Blind Challenge*, a Hugging Face Space by openadmet, <https://huggingface.co/spaces/openadmet/cyp-challenge>, (accessed 20 September 2026).
2. K. Yang, K. Swanson, W. Jin, C. Coley, P. Eiden, H. Gao, A. Guzman-Perez, T. Hopper, B. Kelley, M. Mathea, A. Palmer, V. Settels, T. Jaakkola, K. Jensen and R. Barzilay, Analyzing Learned Molecular Representations for Property Prediction, *J. Chem. Inf. Model.*, 2019, **59**, 3370–3388.
3. E. Heid, K. P. Greenman, Y. Chung, S.-C. Li, D. E. Graff, F. H. Vermeire, H. Wu, W. H. Green and C. J. McGill, Chemprop: A Machine Learning Package for Chemical Property Prediction, *J. Chem. Inf. Model.*, 2023, **64**, 9–17.
4. J. W. Burns, A. S. Zalte, C. R. A. Abreu, J. Sieg, C. Feldmann, M. Mathea and W. H. Green, Deep Learning Foundation Models from Classical Molecular Descriptors, *arXiv*, 2026, preprint, arXiv:2506.15792, DOI: 10.48550/arXiv.2506.15792.
5. H. Veith, N. Southall, R. Huang, T. James, D. Fayne, N. Artemenko, M. Shen, J. Inglese, C. P. Austin, D. G. Lloyd and D. S. Auld, Comprehensive Characterization of Cytochrome P450 Isozyme Selectivity across Chemical Libraries, *Nat. Biotechnol.*, 2009, **27**, 1050–1055.
6. PubChem BioAssay AID 1851, qHTS Assay for Cytochrome Panel, National Center for Advancing Translational Sciences, <https://pubchem.ncbi.nlm.nih.gov/bioassay/1851>, (accessed 17 September 2026).
7. 450 nm, *CYP Campaign: OpenADMET Blind Challenge*, operating dashboard, <https://openadmet-cyp-dashboard.vercel.app/operating_dashboard>, (accessed 20 September 2026).
8. SuperCowPowers, The CYP Challenge — Working Notes, *ADMET Workbench*, <https://supercowpowers.github.io/workbench/blogs/cyp_challenge/>, (accessed 3 September 2026).
9. Y. Benjamini and Y. Hochberg, Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing, *J. R. Stat. Soc. Series B Stat. Methodol.*, 1995, **57**, 289–300.
10. R. Caruana, A. Niculescu-Mizil, G. Crew and A. Ksikes, Ensemble Selection from Libraries of Models, *Twenty-First International Conference on Machine Learning (ICML '04)*, ACM Press, Banff, Alberta, Canada, 2004, p. 18.
11. lachrymator, *OpenADMET CYP Challenge — public write-up*, <https://github.com/lachrymator/openadmet-cyp-challenge-public>, (accessed 15 September 2026).
12. P. J. Ropp, J. C. Kaminsky, S. Yablonski and J. D. Durrant, Dimorphite-DL: An Open-Source Program for Enumerating the Ionization States of Drug-like Small Molecules, *J. Cheminform.*, 2019, **11**, 14.
13. I. Koleiev, R. Stratiichuk, N. Shevchuk, M. Melnychenko, O. Nyporko, D. Todoryshyn, V. Husak, S. Starosyla, S. Yesylevskyy and A. Nafiiev, Critical Assessment of ML Models for ADMET Prediction in TDC Leaderboards, *bioRxiv*, 2026, preprint, DOI: 10.64898/2026.02.26.708193.