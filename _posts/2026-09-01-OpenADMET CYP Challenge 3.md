---
layout: post
title: Upgrading Environment and Full 5x5 Cross-Validation
date: 2026-09-01
description: Running the full repeated cross-validation comparison, checking whether the single-fold screen's winner actually holds up and fixing an environment problem that had been throttling every run.
tags: cheminformatics machine-learning admet python pharmaceutical-science
categories: dissertation
---

## What this post covers

Notebook 04a's single-fold screen gave us a winner. But this post asks the real question: does that winner survive a proper repeated cross-validation or was it just a lucky split? I also explain an environment fix that had been throttling every single run and explain why fixing it completely changes the compute budget moving forward.

## Getting off Rosetta first

Before I could trust any timing estimates enough to plan around them, I needed to figure out why the runs seemed slow. It turns out the `cyp-admet` environment had been running under Rosetta (Apple's x86_64-on-Apple-Silicon emulation layer). This wasn't a deliberate choice, the environment was built from an x86_64 base early on and I simply never revisited it.

The main symptom was an `OMP_NUM_THREADS=1` constraint that I had treated as a fixed cost. It wasn't. It was just a workaround for instability caused entirely by the emulation layer. Once I realised that, the fix was easy: a clean rebuild into a native arm64 Miniconda environment (`cyp-admet-v2`). I validated it by rebuilding from scratch in a duplicate repo just to be sure. The original environment stays untouched as a fallback—I don't trust unchecked migrations.

The result? A 27x speedup over the original baseline. That's a massive jump, and it redefines what "expensive" means for the rest of this project. My previous estimate of 5–6 hours for fine-tuning CheMeleon<sup>1</sup> was based on the old, throttled setup.

One thing this migration *didn't* fix: Apple's Metal Performance Shaders (MPS) backend remains unusable for Chemprop.<sup>2</sup> This isn't an environment issue. It happens because `scatter_reduce_mps` lacks a deterministic kernel, and Chemprop automatically forces deterministic algorithms whenever a seed is set. There is no bypass flag for this. CPU-only was the right choice for Chemprop and CheMeleon on this hardware, and it still is—it's just a genuinely fast CPU now.


## Testing the 04a winner properly (notebook 05)

In the last post, CheMeleon-initialised multitask Chemprop won the single-fold screen by a clear margin. But one fold doesn't prove a model is a reliable winner. Notebook 05 runs the rigorous comparison Ash et al.<sup>3</sup> actually recommend: a 5x5 repeated CV yielding 25 genuinely distinct folds across 12 configurations.

### The assumption checks

Ash's paper notes that the homogeneity-of-variance assumption "will rarely be violated." Here, it was violated constantly. Levene's test variance ratios ranged from comfortably under the 9x tolerance (for MAE) to a massive 624x for CYP2C9's R². 

The naive mean and weaker tabular configs swing wildly across folds, while the stronger configs cluster tightly. QQ plots of the ANOVA residuals backed this up, with CYP2D6's ST-RAE showing one dramatic outlier fold pulling visibly away from the normal line. 

*(Note: k-fold CV's own variance has no unbiased estimator,<sup>4</sup> so this assumption-checking pipeline is running on a quantity that's already noisier than it looks. It's not a reason to skip checks, but a reason not to blindly trust a clean-looking result either.)*

![Boxplot and stripplot of ST-RAE point estimates across all 25 folds, one panel per isoform, all 12 configs shown, sorted best to worst](/assets/img/posts/fold_strae_boxplot_per_isoform.png)
*Fold-level ST-RAE distributions per isoform. Each dot is one of the 25 fold point estimates for that config. The weaker configs at the bottom of each panel visibly spread wider than the tightly clustered top tier, the same pattern the Levene's test variance ratios above describe numerically.*

The practical consequence: MAE stayed on the parametric branch (ANOVA + Tukey HSD) in every comparison, but ST-RAE—the primary metric I actually care about—was nonparametric (Friedman + Conover-Friedman, BH-corrected) across the board. I'm stating that explicitly here so we don't assume ST-RAE behaves identically to MAE.

### Does the 04a winner hold up?

| Comparison | CLD | Uniquely best? | Shares top letter with |
|---|---|---|---|
| CYP1A2 | a | No | ecfp4_narrow__rf, chemeleon__rf, ecfp4_narrow__lightgbm |
| CYP2C9 | a | Yes | (alone) |
| CYP2D6 | d | No, mediocre | naive_mean (also "d"), three tiers below the top group |
| CYP3A4 | a | No | ecfp4_narrow__lightgbm |
| MA (macro) | a | Yes, of the 3 compared | (Chemprop-family comparison only, tabular configs weren't in scope here) |

At the macro level, the CheMeleon-init win holds. It beats random-init Chemprop and the naive floor across all 25 folds. 

But when we look at individual isoforms, the single-fold story falls apart. CheMeleon-init is only uniquely and significantly best on CYP2C9. On CYP1A2 and CYP3A4, it's statistically tied with tabular configs—a win over the floor, but not a clean sweep over the best alternatives. On CYP2D6, it lands in the exact same letter group as `naive_mean`. It is statistically indistinguishable from just guessing the mean, while three tabular configs sit significantly ahead of it.

![Forest plot of mean ST-RAE with 95% CI across 25 folds, one panel per isoform, dot colour showing CLD tier relative to that isoform's best config](/assets/img/posts/forest_plot_curated_headline.png)
*Mean ST-RAE per config across the full 25-fold CV, dashed red line marks the naive-mean floor, lower and further left is better. Dark green is the single best config for that isoform, light green is statistically tied with it, red is significantly worse. CYP2C9 (top right) is the cleanest case, CheMeleon-init alone in dark green. CYP2D6 (bottom left) is the outlier: CheMeleon-init sits in red alongside naive_mean, while three tabular configs occupy the best tier.*

![Grid of config x isoform cells, coloured by CLD tier and labelled with letter and rank, for a curated 6-config subset](/assets/img/posts/cld_grid_curated.png)
*Same result as the forest plot above, compressed into one glance: rows are config slots, columns are isoforms, colour is CLD tier. Reading across the chemprop_chemeleoninit row shows green or light green for three isoforms and red for CYP2D6.*

The headline numbers behind that table:

| Isoform | Best config | ST-RAE | R² | CheMeleon-init multitask R² |
|---|---|---|---|---|
| CYP1A2 | chemprop_chemeleoninit (tied, 4-way) | 0.868 | 0.227 | 0.227 |
| CYP2C9 | chemprop_chemeleoninit | 0.679 | 0.384 | 0.384 |
| CYP2D6 | chemeleon__rf | 0.937 | 0.142 | 0.098 |
| CYP3A4 | chemprop_chemeleoninit | 0.546 | 0.561 | 0.561 |

So, our "winner" from 04a was a real, non-fluke config, but recommending it universally was an oversimplification. For CYP2D6 specifically, the data actually supports an isoform-specific choice—a tabular RF or LightGBM model.

### A second, unrelated finding: simpler descriptors keep winning

Across three of the four isoforms, the nine-descriptor `ecfp4_narrow` feature set (adapted from Kiani and Jabeen's CYP450-specific determinants<sup>5</sup>) beat both the full Mordred PCA feature set and the CheMeleon frozen embeddings when paired with RF or LightGBM. I wouldn't have guessed that going in. Throwing more features and a foundation-model embedding at the problem didn't automatically buy anything over nine well-chosen physicochemical descriptors.

## CYP2D6: the CV number and the leaderboard number point in opposite directions

This is the finding that matters most for where the project goes next. CheMeleon-init multitask's CV R² on CYP2D6 is 0.098. That's weak, but positive. However, on the real blind leaderboard (from the actual submission in the last post), its R² was -0.622. 

That is not a small gap; it is a complete inversion. And it's strictly isoform-specific: the other three isoforms scored *better* on the real blind set than they did in CV. Only CYP2D6 goes the opposite way.

This inversion is new evidence, and it operates at the model level rather than the compound level. The last post ruled out four candidate explanations by looking at individual compounds (systematic bias, measurement-uncertainty tracking, nearest-neighbour similarity, activity-cliff proximity). None of them explained CYP2D6 specifically. 

While this CV-vs-blind gap doesn't identify an exact mechanism, it adds heavy weight to the test-set-construction theory. CYP2D6 didn't seed the real test set's hit-expansion process the way the other three isoforms did. Whatever population the blind CYP2D6 compounds were drawn from likely doesn't resemble the CV folds, which were built specifically from CYP2D6's own training distribution.

## Where this leaves things

Two main takeaways. First, CheMeleon-init multitask is genuinely strong, but it isn't the universal winner I initially thought. Second, CYP2D6 is officially confirmed as our problem isoform by three independent angles: it failed the single-fold screen, it tied with the naive floor in the 25-fold CV, and it inverted sharply on the real leaderboard.

Next steps will be tightly scoped to CYP2D6 rather than a general re-run of everything. I'll run an outlier check on its CV residuals (freezing the exclusion threshold first), then restrict weighting and tuning to the tabular candidates that actually beat the floor. This includes testing a version of `ecfp4_narrow` cut down to just the seven CYP2D6-specific descriptors from Kiani and Jabeen's decision tree. Ensemble selection comes after that once I know which CYP2D6 model is actually worth keeping.

---

## References

1. J. W. Burns, A. S. Zalte, C. R. A. Abreu, J. Sieg, C. Feldmann, M. Mathea and W. H. Green, Deep Learning Foundation Models from Classical Molecular Descriptors, *arXiv*, 2026, preprint, arXiv:2506.15792, DOI: 10.48550/arXiv.2506.15792.
2. E. Heid, K. P. Greenman, Y. Chung, S.-C. Li, D. E. Graff, F. H. Vermeire, H. Wu, W. H. Green and C. J. McGill, Chemprop: A Machine Learning Package for Chemical Property Prediction, *J. Chem. Inf. Model.*, 2023, **64**, 9-17.
3. J. R. Ash, C. Wognum, R. Rodríguez-Pérez, M. Aldeghi, A. C. Cheng, D.-A. Clevert, O. Engkvist, C. Fang, D. J. Price, J. M. Hughes-Oliver and W. P. Walters, Practically Significant Method Comparison Protocols for Machine Learning in Small Molecule Drug Discovery, *J. Chem. Inf. Model.*, 2025, **65**, 9398-9411.
4. Y. Bengio and Y. Grandvalet, No Unbiased Estimator of the Variance of K-Fold Cross-Validation, *J. Mach. Learn. Res.*, 2004, **5**, 1089-1105.
5. Y. S. Kiani and I. Jabeen, Exploring the Chemical Space of Cytochrome P450 Inhibitors Using Integrated Physicochemical Parameters, Drug Efficiency Metrics and Decision Tree Models, *Computation*, 2019, **7**, 26.