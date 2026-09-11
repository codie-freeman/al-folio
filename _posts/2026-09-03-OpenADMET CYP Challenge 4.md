---
layout: post
title: Four questions about CYP2D6
date: 2026-09-03
description: Working through the CYP2D6 outlier check, sample weighting and tuning, ensemble selection across all four isoforms, and a placement-correction diagnostic that talked us out of pursuing it.
tags: cheminformatics machine-learning admet python pharmaceutical-science
categories: dissertation
---

## What this post covers

This post covers four notebooks in my repository, I wanted to know if excluding CYP2D6's worst compounds help? (Notebook 06). Does sample weighting or hyperparameter tuning add anything on top of that? (07). If a simple-average ensemble across all four isoforms improved scoring? (08). And taking advice from another entrant on cheap linear correction? (09).

## Step 1: does excluding CYP2D6's worst compounds help? (notebook 06)

I tried two independent ways to flag potentially negative CYP2D6 compounds.

The first method looked at CV residuals (the top 5% by out-of-fold prediction error, regardless of which model was used). The second looked at CI width (the top 5% widest confidence intervals, essentially flagging measurement uncertainty). Interestingly, only 26 compounds overlapped between the two sets.

Excluding the residual-flagged compounds from training—and retraining across all 25 folds—significantly improved ST-RAE for three out of four configs (`chemeleon__rf` p=4.6e-08, `chemeleon__lightgbm` p=5.1e-04, `chemprop_chemeleoninit` p=1.6e-05). The fourth (`ecfp4_narrow__lightgbm`) trended the same way but just missed significance (p=0.052). R² wasn't detectably affected either way. 

Excluding the CI-width-flagged compounds told a different story. Only `chemprop_chemeleoninit` improved significantly, while R² got significantly *worse* for all three tabular configs. Removing a model's own hardest compounds helps; removing the compounds with the widest uncertainty bounds doesn't, and actively costs the tabular models on R².

I checked whether masking only the CYP2D6 labels had actually left the other three isoforms alone. The `chemprop_chemeleoninit`'s raw predictions for CYP1A2, CYP2C9, and CYP3A4 diverged from the notebook 05 baseline much more than they should have (Pearson r 0.92-0.95, not ~1.0) even though those isoforms' labels were never touched.

I tested two competing explanations in order:

1. **Does it matter which compounds get masked?** Residual and CI-width exclusions mask 74% different compounds, but they produced nearly identical divergence magnitudes and the same per-isoform ordering (CYP1A2 shifted the most, CYP2C9 the least). If the specific compounds being masked were driving the shift, two criteria masking different compounds shouldn't land this close together. This pointed towards generic training noise rather than the masking content.
2. **Is it actually training nondeterminism?** I ran two identical, back-to-back `chemprop_chemeleoninit` fits with the same seed and zero exclusion. The result? Bit-identical checkpoints (same MD5 hash) and byte-for-byte identical predictions. On this machine, for this config, chemprop training is fully deterministic. That ruled out nondeterminism more decisively than I expected.

With both explanations eliminated, I checked if masking CYP2D6's labels had silently changed anything else in the training CSV: row order, split assignment, NaN handling, or row count. All four checks passed cleanly. The only difference was the intended NaN in the CYP2D6 column.

That leaves me with a leading hypothesis, though not a confirmed one. Chemprop's<sup>1</sup> multitask loss likely weights each task by how many valid labels it has in a batch. Masking 59 of CYP2D6's labels in a given fold doesn't just remove CYP2D6 signal—it changes CYP2D6's share of the combined loss. That could easily shift the shared encoder's gradient enough to move the other three isoforms, even though their own labels never changed. 

I haven't directly verified this against chemprop's actual loss implementation, so I'm treating it as a plausible mechanism rather than fact. The residual-exclusion win on CYP2D6 still stands, but this complicates the *causal story* behind it. Some of the improvement might be a genuine data-quality effect, and some might just be an implicit reweighting effect. Right now, I can't separate the two.

## Step 2: sample weighting and hyperparameter tuning (notebook 07)

I tested two independent levers against 06's residual-excluded baseline. I restricted this to the two tabular CYP2D6 configs (`chemprop_chemeleoninit` is deliberately sitting this one out, given the unresolved entanglement from Step 1).

**Sample weighting was a clean negative result.** The scheme (inverse local density, fit per fold via Gaussian KDE on the training pool, never touching the held-out test compounds, with weights clipped at 5x) down-weights the dense middle of the pIC50 distribution and boosts the sparse tails. 

It made both metrics significantly worse. ST-RAE went up for `chemeleon__rf` (0.902 → 0.979, p=2.4e-11) and `chemeleon__lightgbm` (0.930 → 0.992, p=3.3e-11), and R² dropped for both. Most test compounds live in that dense middle. Deliberately starving them of signal cost us heavily, outweighing whatever the rare-tail compounds gained.

![Boxplot comparing 25-fold ST-RAE and R2 distributions before and after sample weighting, for both tabular CYP2D6 configs](/assets/img/posts/weighting_before_after_distributions.png)
*Weighting lever, before vs. after, both configs and both metrics. The "after" boxes sit clearly worse for every panel, not driven by a handful of unlucky folds.*

**Hyperparameter tuning was small but real for one config.** I chopped the RF grid down from 64 to 24 combinations because the full grid was projecting a 24-30 hour runtime. This wasn't a silent cut; I dropped the deeper, larger end of the grid (`n_estimators=1500` and `max_depth` of `None`/30) because it sits deep in overfitting territory for a dataset this size. 

The tuned `chemeleon__rf` improved significantly on both metrics (ST-RAE 0.902 → 0.897, p=0.013; R² 0.136 → 0.140, p=0.036), landing on `n_estimators=1000, max_depth=10, min_samples_leaf=5`. `chemeleon__lightgbm` trended in the same direction but didn't reach significance (p=0.39).

![Heatmap grid of mean inner-validation RAE across the reduced RF hyperparameter grid, faceted by min_samples_leaf](/assets/img/posts/tuning_landscape_chemeleon__rf.png)
*RF's tuning search landscape. The range is narrow (0.915-0.921) but the trend is consistent: shallower depth and fewer minimum leaf samples both help, supporting the decision to drop the deeper, larger end of the original grid.*

Going into Step 3, `chemeleon__rf` carries forward **tuned**, while `chemeleon__lightgbm` carries forward **unchanged** from the 06 baseline.

## Step 3: does ensembling help isoform by isoform? (notebook 08)

I stuck to simple averages deliberately here. Every combination gets equal weight, and absolutely nothing is fit to the out-of-fold predictions. Fitting ensemble weights on the exact same predictions used to evaluate them is a potential leakage trap I wanted to avoid. 

I pulled each isoform's candidate pool from 05's top CLD tier (or the per-config winners from Step 2 for CYP2D6), scored every non-trivial subset and ran paired comparisons against the current single best model, following the same protocol Ash et al.<sup>2</sup> established for every other statistical comparison in this project.

**CYP1A2** had four tied candidates, correlating between 0.65 and 0.84 with each other. Ten of the eleven possible combinations beat the single best model significantly. The only exception was the pair sharing the same `ecfp4_narrow` feature set—which also happened to be the most correlated pair (r=0.841). Ultimately, the full four-way average won outright, dropping ST-RAE from 0.868 to 0.802.

**CYP2C9** only had one candidate in its top tier, so there was nothing to ensemble. It carries forward unchanged.

**CYP2D6** is the most interesting case. It had three candidates. Averaging the two tabular models together (without the multitask model) actually made ST-RAE significantly *worse* (0.897 → 0.902, p=0.038).

![Pairwise Pearson correlation heatmap for CYP2D6's three ensemble candidates](/assets/img/posts/correlation_heatmap_CYP2D6.png)
*CYP2D6's candidate pool. The two tabular models correlate at 0.769, the highest pairwise value in this pool, the pair that turned out to hurt when averaged.*

The CYP2D6 winner was `chemeleon__rf` (tuned) + `chemprop_chemeleoninit`, dropping ST-RAE from 0.897 to 0.877 (p=2.8e-06). Just to be thorough, I went back and tested the previously-excluded `ecfp4_narrow__lightgbm` as a fourth candidate against this new champion. None of the seven combinations including it managed to beat the champion.

![Boxplot comparing CYP2D6's 25-fold ST-RAE before and after the winning ensemble](/assets/img/posts/before_after_CYP2D6.png)
*CYP2D6's before/after: the winning pair's fold-level ST-RAE sits visibly below the single best model's, with minimal overlap between the two distributions.*

**CYP3A4** had two tied candidates, leaving exactly one possible combination. It won decisively (ST-RAE 0.546 → 0.503, p=2.0e-07) despite the pair being fairly correlated (r=0.814). This was the largest single-step improvement of any isoform in the notebook.

## Step 4: is a placement correction worth chasing? (notebook 09)

You can decompose R² cleanly into three pieces: $R^2 = 2\rho k - k^2 - b^2$, where $\rho$ is the correlation between predicted and true values, $k$ is the ratio of their spreads, and $b$ is the standardised bias. 

Because correlation is invariant to any linear transform, a linear rescale-and-shift correction can only ever fix the $k$ and $b$ terms. The idea of using this breakdown to figure out which isoforms have a recoverable R² gap isn't originally mine; it follows a working-notes write-up from another entrant on this same challenge, SuperCowPowers.<sup>3</sup>

Applying this breakdown to the winning predictions from Step 3 gave a strikingly uniform answer. Across every single isoform, 98-99.6% of the R² gap is caused by $\rho$ (imperfect correlation) alone. The scale and bias terms combined—the only parts a linear correction can touch—account for under 2.2% of the gap.

| Isoform | ρ | k | b | Scale share | Bias share | Combined |
|---|---|---|---|---|---|---|
| CYP1A2 | 0.516 | 0.428 | 0.003 | 1.05% | 0.00% | 1.05% |
| CYP2C9 | 0.632 | 0.708 | -0.008 | 0.93% | 0.01% | 0.94% |
| CYP2D6 | 0.419 | 0.353 | 0.101 | 0.51% | 1.21% | 1.72% |
| CYP3A4 | 0.776 | 0.739 | -0.007 | 0.37% | 0.01% | 0.37% |

![Scatter of predicted vs. true pIC50, one panel per isoform, y=x line marked](/assets/img/posts/predicted_vs_true_all_isoforms.png)
*Predicted vs. true pIC50, all four isoforms. Every point cloud sits compressed toward the mean relative to the diagonal, the visual signature of k < 1 for all four, rather than a shift. CYP2D6 (bottom left) is also visibly the noisiest cloud and the only one with a non-trivial bias term.*

I set a hard rule before looking at these numbers: the combined scale-plus-bias share had to reach at least 10% to justify the cost of running a properly nested-CV-validated correction. Even a *perfect* correction below that bar would barely move the needle, easily getting lost in fold-to-fold noise. 

CYP2D6 was the closest at 1.72%, which isn't close at all. Because all four fell drastically short of the threshold, I completely skipped the nested-CV validation step. Every isoform just gets the identity transform (`slope=1.0, intercept=0.0`). The winning predictions from Step 3 stand as the current best, uncorrected.

*(Side note: an early version of my correction formula was based on a misreading of the original spec—a variance-matching rescale rather than an OLS fit of true against predicted. Working through the algebra caught the error early. OLS shrinks by a factor of $\rho$ to exactly reproduce standard regression-to-the-mean ($R^2_{\text{corrected}} = \rho^2$), while the variance-matching sketch would have over-corrected.)*

## Where this leaves things

Here is our current best model lineup for whatever comes next:
*   **CYP1A2:** Four-way ensemble average
*   **CYP2C9:** Single `chemprop_chemeleoninit` model
*   **CYP2D6:** `chemeleon__rf` (tuned) + `chemprop_chemeleoninit` pair
*   **CYP3A4:** `chemprop_chemeleoninit` + `ecfp4_narrow__lightgbm` pair

All are uncorrected since the R² gaps weren't placement-recoverable. CYP2D6 is sitting measurably better than it was two posts ago (ST-RAE down to 0.877 from 0.937). However, the causal story behind *why* it improved—whether it was a real data-quality effect or an implicit multitask reweighting quirk—remains an open thread from Step 1 that we haven't resolved. 

---

## References

1. E. Heid, K. P. Greenman, Y. Chung, S.-C. Li, D. E. Graff, F. H. Vermeire, H. Wu, W. H. Green and C. J. McGill, Chemprop: A Machine Learning Package for Chemical Property Prediction, *J. Chem. Inf. Model.*, 2023, **64**, 9-17.
2. J. R. Ash, C. Wognum, R. Rodríguez-Pérez, M. Aldeghi, A. C. Cheng, D.-A. Clevert, O. Engkvist, C. Fang, D. J. Price, J. M. Hughes-Oliver and W. P. Walters, Practically Significant Method Comparison Protocols for Machine Learning in Small Molecule Drug Discovery, *J. Chem. Inf. Model.*, 2025, **65**, 9398-9411.
3. SuperCowPowers, The CYP Challenge — Working Notes, *ADMET Workbench*, <https://supercowpowers.github.io/workbench/blogs/cyp_challenge/>, (accessed 03 September 2026).