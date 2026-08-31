---
layout: post
title: A baseline model, a real submission, and a dead end worth having
date: 2026-08-26
description: Freezing the evaluation framework, screening candidate models, submitting to the real leaderboard, and investigating why one isoform diverged sharply from what the screen predicted.
tags: cheminformatics machine-learning admet python pharmaceutical-science
categories: dissertation
---

## What this post covers

This post covers four notebooks. Freezing the evaluation framework, running a cheap screen across candidate models and making an initial submission to the live leaderboard. Then investigating why CYP2D6 perform so bad across all scoring metrics?

## Freezing the evaluation framework (notebook 03)

Before comparing models, you have to lock in how the data is split and what features each model sees.

| Frozen artifact | Choice | Source / rationale |
|---|---|---|
| CV split | 5x5 repeated random CV (`RepeatedKFold`, seed 42) | Ash et al.'s statistical framework for practically significant model comparison<sup>1</sup> |
| Feature set 1 | Narrow, 9-descriptor set | Adapted from Kiani and Jabeen's CYP450-specific determinants<sup>2</sup> |
| Feature set 2 | Full RDKit 2D descriptors | Matches the official OpenADMET baseline recipe |
| Feature set 3 | CheMeleon foundation-model embeddings | Frozen forward pass, no fine-tuning<sup>3</sup> |

CYP2D6 reportedly uses a different assay technology from the other three isoforms. If that caused it to cluster unevenly under a plain random split, any later comparison involving CYP2D6 would just be measuring split noise rather then model performance. Testing for this CYP2D6's per-fold representation sits at a 4.3% relative standard deviation across folds, in line with the other isoforms. 

I also checked whether the 5x5 CV gave us five independent looks at the data, rather than five near-copies of one split. Looking at fold membership pairwise, the overlap is close to the expected ~20%.

## A side experiment (notebook 03b)
 
Alongside the main comparison, I trained a Chemprop encoder on the log2fc primary-screen data (4,376 compounds, 50 epochs, no validation split). I froze it afterwards to use as a feature source. 

OpenADMET's tutorial<sup>7</sup> notes that using this single-dose data helped participants in their earlier PXR induction challenge. Whether it's actually useful or makes the final comparison is not yet tested. 

## The baseline screen (notebook 04a)

Following on from notebooks 03 I ran a cheap single-fold screen, the goal wasn't a full 5x5 cross validation but to catch anything obviously broken before spending compute time on the full CV.

| Category | Configurations | Detail |
|---|---|---|
| Naive floor | 2 | Mean, median |
| Tabular | 9 | 3 feature sets x random forest / XGBoost / LightGBM |
| Chemprop<sup>6</sup> | 10 | 4 single-task + 1 multitask, each random-init and CheMeleon-init |
| **Total** | **21** | |

TabICLv2—the strongest baseline in OpenADMET's inital leaderboard was tested but ultimately dropped due to hardware restraints.

| Configuration | ST-RAE | MAE | R² | Spearman's rho |
|---|---|---|---|---|
| **CheMeleon-init multitask Chemprop** | **0.700** | **0.574** | **0.352** | **0.583** |
| Tabular (ECFP4 + narrow descriptors) / RF | 0.774 | 0.603 | 0.292 | 0.518 |
| Tabular (full RDKit 2D) / RF | 0.787 | 0.613 | 0.271 | 0.516 |
| CheMeleon embeddings / RF | 0.793 | 0.625 | 0.262 | 0.527 |
| Random-init multitask Chemprop | 0.926 | 0.708 | 0.082 | 0.403 |
| Naive median | 0.988 | 0.738 | -0.025 | 0.000 |
| Naive mean | 1.007 | 0.745 | -0.007 | 0.000 |

![Macro ST-RAE with 95% bootstrap confidence intervals across all 21 screened configurations, naive baseline marked](/assets/img/posts/macro_strae_errorbar_all_configs.png)
*Macro-averaged ST-RAE across all 21 screened configurations, with the naive-mean baseline marked.*

CheMeleon-initialised multitask Chemprop came out on top for every metric. Across the four architecture pairs the gap between random-init and CheMeleon-init ranges from 0.003 to 0.084 macro ST-RAE. The multitask pair exhibited a 0.700 vs 0.926 gap. 

Random-init multitask alone barely beats the naive mean. This likely indicates that CheMeleon's pretrained weights rather then the multitask architecture itself is driving performance. Compute cost however showed CheMeleon-init models ran 28 to 83 times slower on my hardware, an investigation into wether this is working as expected or a setup issue is causing slow run times will be done before the full CV.

## Submitting for real (notebook 04b)

I retrained the winning configuration on the full training set. Training ran for 21 epochs (taking approx. five hours), using a small internal validation slice for early stopping.

Predictions on the 750 compound test set were validated against the tutorial's submission checker,<sup>7</sup> then submitted to the live leaderboard under 'fold-zero'.

| Track | Rank | ST-RAE | MAE | R² | Spearman's rho | Kendall's tau |
|---|---|---|---|---|---|---|
| Overall (macro) | 21 | 0.7179 | 0.8952 | 0.2191 | 0.6739 | 0.5008 |
| CYP1A2 | 22 | 0.7114 | 0.9589 | 0.2824 | 0.7430 | 0.5473 |
| CYP2C9 | 18 | 0.5408 | 0.5399 | 0.5263 | 0.7428 | 0.5490 |
| CYP2D6 | 23 | 1.1903 | 1.5842 | -0.6220 | 0.3769 | 0.2606 |
| CYP3A4 | 3 | 0.4291 | 0.4976 | 0.6898 | 0.8329 | 0.6463 |

![Grouped bar chart comparing each isoform's screen-predicted and real leaderboard ST-RAE](/assets/img/posts/screen_vs_real_strae_per_isoform.png)
*ST-RAE per isoform, screen-predicted versus real leaderboard result.*

Keep in mind this is one trained model from a single run, not the full repeated CV comparison. Three isoforms landed close to what the screen predicted, with CYP3A4 coming in stronger than predicted. 

CYP2D6 however went from being the weakest isoform in the screen (though still outperforming all other models) to performing worse than the naive baseline on the real test set. The screening gave no warning of it performing this poorly.

## Where it went wrong on CYP2D6

The gap between the screen's estimate and the real result was too large to just be single-fold noise. So, I started testing potential explanations.

### Is it a biased model?

![Fold-0 residual (predicted minus actual) distribution, per isoform](/assets/img/posts/fold0_residual_histogram.png)
*Fold-0 residual distributions, per isoform. CYP2D6 (bottom left) is small and roughly symmetric around zero, not visibly skewed the way CYP1A2 (top left) is.*

Does this configuration's CYP2D6 output systematically lean one way? I checked the fold-0 predictions against ground truth. The residuals are small and balanced (mean 0.032), with a 54/46 split between over- and under-predictions. There's no systematic bias in its in-sample behaviour. Which rules out the simplest explanation.

### Does it track measurement uncertainty?

![Residual vs. CI width, per isoform](/assets/img/posts/residual_vs_ci_width_scatter.png)
*Residual against ground-truth confidence-interval width, per isoform. The positive trend is visible for all four, CYP2D6 included.*

Unsurprisingly, larger residuals correlate with wider confidence intervals for every isoform (r = 0.65-0.76). However this applies across all four isoforms and is not just isolated to CYP2D6.

### Does it track structural novelty?

I ran two checks against the fold-0 residuals: nearest-neighbour Tanimoto similarity to the training compounds and proximity to a known activity cliff. 

I recomputed the CYP2D6 SALI cliff pairs from notebook 02, using the same settings (Tanimoto ≥0.4, potency difference ≥1 log unit). Neither check showed a relationship. Nearest-neighbour similarity correlated near zero across the board and cliff proximity for CYP2D6 was just 0.016.

![CYP2D6 residual vs. similarity to nearest activity-cliff partner](/assets/img/posts/cyp2d6_residual_vs_cliff_distance.png)
*CYP2D6 fold-0 residual against maximum Tanimoto similarity to the nearest known cliff-pair partner. No visible trend.*

### What's left, descriptively

![CYP2D6 blind-set prediction distribution overlaid on training-label distribution](/assets/img/posts/cyp2d6_blind_vs_training_distribution.png)
*Blind-set predictions against training labels, all four isoforms. CYP2D6 (bottom left) is the only one where the blind mean sits below the training mean.*

Without ground truth for the blind set, we can only describe the predictions. CYP2D6 predictions sit lower on average than the training labels (4.515 vs 4.784) and are much more compressed. Crucially, it's the only isoform where the blind mean sits below the training mean. This heavily suggests a population mismatch, but we can't confirm it without the true values.

### Four checks, one lead left standing

None of the testable drivers explain why CYP2D6 specifically diverged. 

| Candidate driver | Test | Result | Explains CYP2D6? |
|---|---|---|---|
| Systematic bias | Fold-0 residual mean and sign split | Small, balanced (mean 0.032, 54%/46%) | No |
| Measurement uncertainty | Residual vs. CI width | r = 0.65-0.76, but present for all four isoforms | No, not CYP2D6-specific |
| Structural novelty (general) | Residual vs. nearest-neighbour similarity | r near zero for all four isoforms | No |
| Structural novelty (cliffs) | CYP2D6 residual vs. cliff-partner similarity | r = 0.016 | No |

The configuration probably handles CYP2D6 chemistry just fine in general. If not one of these checks would have likely caught it.

What's left is a construction difference I flagged in the previous post. CYP1A2, CYP2C9, and CYP3A4 seeded the real test set's construction; CYP2D6 did not. Its values were simply measured on that same compound pool as a side effect. CYP2D6's training data comes from compounds specifically screened for it. 

The training and test populations might simply be drawn differently. None of our checks would catch this because they were computed against random-split data, not anything resembling the actual test set's construction.

## Where this leaves things

The CYP2D6 collapse still doesn't have a confirmed cause after these checks. Systematic bias, measurement uncertainty and structural novelty are all ruled out. The strongest remaining lead is that CYP2D6 wasn't used to seed the real test set's construction the way the other three isoforms were.

---

## References

1. J. R. Ash, C. Wognum, R. Rodríguez-Pérez, M. Aldeghi, A. C. Cheng, D.-A. Clevert, O. Engkvist, C. Fang, D. J. Price, J. M. Hughes-Oliver and W. P. Walters, Practically Significant Method Comparison Protocols for Machine Learning in Small Molecule Drug Discovery, *J. Chem. Inf. Model.*, 2025, **65**, 9398-9411.
2. Y. S. Kiani and I. Jabeen, Exploring the Chemical Space of Cytochrome P450 Inhibitors Using Integrated Physicochemical Parameters, Drug Efficiency Metrics and Decision Tree Models, *Computation*, 2019, **7**, 26.
3. J. W. Burns, A. S. Zalte, C. R. A. Abreu, J. Sieg, C. Feldmann, M. Mathea and W. H. Green, Deep Learning Foundation Models from Classical Molecular Descriptors, *arXiv*, 2026, preprint, arXiv:2506.15792, DOI: 10.48550/arXiv.2506.15792.
4. N. J. Wichrowski, M. V. Clemens-Sewall, K. K. Rao, C. Richardson, N. Q. Le, P. T. Koshute, J. Y. Liu, Y. Chushak, J. P. Coyle, T. R. Sterner and R. A. Clewell, Multitask Pretraining Framework for Improving Predictivity of Machine Learning Chemical Bioactivity Models for Low-Data Endpoints, *Chem. Res. Toxicol.*, 2026, **39**, 722-733.
5. D. West and J. Burns, Throwing Everything AND the Kitchen Sink at CheMeleon, https://openadmet.ghost.io/throwing-everything-and-the-kitchen-sink-at-chemeleon/, (accessed 27 August 2026).
6. E. Heid, K. P. Greenman, Y. Chung, S.-C. Li, D. E. Graff, F. H. Vermeire, H. Wu, W. H. Green and C. J. McGill, Chemprop: A Machine Learning Package for Chemical Property Prediction, *J. Chem. Inf. Model.*, 2023, **64**, 9-17.
7. OpenADMET, *CYP-Challenge-Tutorial*, https://github.com/OpenADMET/CYP-Challenge-Tutorial, (accessed 25 August 2026).
8. R. Guha and J. H. Van Drie, Structure-Activity Landscape Index: Identifying and Quantifying Activity Cliffs, *J. Chem. Inf. Model.*, 2008, **48**, 646-658.