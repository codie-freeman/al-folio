---
layout: post
title: Live leaderboard collapse, what CV-to-blind mismatch actually shows
date: 2026-09-08
description: The real leaderboard record for all four submissions this project has made, why ensembling keeps failing to generalize, and one genuinely new problem the fix introduced.
tags: cheminformatics machine-learning admet python pharmaceutical-science
categories: dissertation
---

## What this post covers

We now have four real submissions on the leaderboard: `04b` (the original single-model baseline), `10c` (a control isolating one variable), notebook 10 (the first ensembling attempt, which collapsed), and notebook 12 (a revised ensembling attempt meant to fix it). This post digs into what the full record across all four actually shows, rather than just focusing on the collapse.

## Four submissions, one metric

| Isoform | 04b | 10c | NB10 | NB12 |
|---|---:|---:|---:|---:|
| **Macro** | 0.7179 | 0.7138 | 0.8299 | 0.8299 |
| CYP1A2 | 0.7114 | 0.6954 | 0.7850 | 0.7633 |
| CYP2C9 | 0.5408 | 0.5489 | 0.5489 | 0.5375 |
| CYP2D6 | 1.1903 | 1.1673 | 1.4603 | 1.4092 |
| CYP3A4 | 0.4291 | 0.4434 | 0.5253 | 0.6095 |

Before we go any further, it's worth noting something odd. NB10 and NB12's macro scores are identical to four decimal places. Since they come from two structurally different recipes with four different per-isoform numbers, I checked this directly. Sure enough, each set of four independently averages to exactly 0.8299. It's a genuine coincidence and not a copy-paste error.

## Ruling out the environment (10c)

Run `10c` used the single `chemprop_chemeleoninit` model with no ensembling and no exclusion. It's as close a recreation of `04b`'s recipe as the repo can produce, just trained under the new `cyp-admet-v2` environment. 

Its macro score (0.7138) sits essentially level with `04b`'s (0.7179), and every isoform lands close. That rules out the environment migration as a cause for any weirdness. The one variable it isolated produced no meaningful change. The slight overall improvement isn't proof of a better environment, either—it's exactly what rigorous selection would predict on its own.

## The CV-to-blind mismatch nobody expected

Before looking at the ensembling mess, we need to check how the single model performed against its own CV estimate. Turns out, this sets up everything that follows:

| Isoform | CV ST-RAE (05) | 10c blind ST-RAE | Gap |
|---|---:|---:|---:|
| CYP1A2 | 0.8685 | 0.6954 | −0.173 |
| CYP2C9 | 0.6787 | 0.5489 | −0.130 |
| CYP2D6 | 1.0039 | 1.1673 | +0.163 |
| CYP3A4 | 0.5461 | 0.4434 | −0.103 |

On three out of four isoforms, the single model does *better* on the real blind set than CV predicted—by a wide margin. Only CYP2D6 goes the other way. 

This isn't what anyone expected walking in. Normally, CV is treated as an optimistic estimate of unseen performance, not a pessimistic one. But here's the catch: it actually aligns with something I found back in the chemical-space notebook. The blind test set sits closer to the training compounds (median nearest-neighbour similarity 0.587) than the training compounds sit to each other (0.450). 

If the blind set is structurally "easier" than the repeated CV folds, doing better on the blind set makes perfect sense. It's a plausible explanation sitting on top of an existing finding, though I haven't directly tested it as a causal mechanism yet.

## Ensembling's repeated collapse, and who it actually hurts

Both ensembling attempts made things worse than the single model, by roughly similar totals. But it's vital to get the isoform-by-isoform pattern right, because it's easy to state backward:

| Isoform | NB10 − 04b | NB12 − 10c | NB12 − its own CV |
|---|---:|---:|---:|
| CYP1A2 | +0.074 | +0.068 | −0.032 |
| CYP2C9 | +0.008 | −0.011 | −0.079 |
| CYP2D6 | +0.270 | +0.242 | +0.523 |
| CYP3A4 | +0.096 | +0.166 | +0.113 |

*(Positive means ensembling made ST-RAE worse.)*

**CYP2D6 is the worst-hit isoform in every one of these comparisons, not the exception.** Its capped-ensemble CV→blind gap alone (+0.523) is more than four times the next-worst isoform's. **CYP2C9 is the one isoform a recent ensembling attempt didn't hurt** at all. Any framing that claims ensembling spared CYP2D6 while hurting the others just doesn't survive contact with the real numbers.

The CV evidence behind these ensembles was solid. The problem is what happened when they hit blind data. Restated on the actual leaderboard metric:

| Isoform | CV ST-RAE margin (08's own test) | Blind ST-RAE decline (NB10 vs 04b) | Decline vs. margin |
|---|---:|---:|---:|
| CYP1A2 | −0.066 (p=6.3e-09) | +0.074 | ~1.1x |
| CYP2D6 | −0.020 (p=2.8e-06) | +0.270 | ~13.8x |
| CYP3A4 | −0.043 (p=2.0e-07) | +0.096 | ~2.2x |

In every ensembled isoform, the blind decline is larger than the entire CV-validated improvement. It didn't just erode the margin; it completely erased it.

![Bar chart comparing each ensembled isoform's CV ST-RAE margin against its blind ST-RAE decline](/assets/img/posts/cv_margin_vs_blind_decline_starae.png)
*CV margin against blind decline, same metric both sides. Every bar shows the decline exceeding the margin.*

## Spread compression: real, but not the whole story

A full pipeline audit didn't turn up any bugs behind NB10's collapse. But it did surface a real pattern: averaging chemprop (wide predictions) with narrower tree-based models compresses the spread. SuperCowPowers, working the same challenge independently, found the true blind population is wider than the training data on every isoform<sup>1</sup>, so this compression pushes predictions further from reality rather than closer to it.

![Bar chart comparing training-set true spread against 04b's and notebook 10's blind prediction spread, four isoforms](/assets/img/posts/training_vs_prediction_spread.png)
*Every prediction sits below the training spread, expected shrinkage under uncertainty, but notebook 10 (red) moved further below it than 04b (blue) on three of four isoforms. CYP2C9's two bars sit almost on top of each other.*

The theory holds at the extremes and inverts in the middle. This is the third time this exact shape has shown up. CYP2D6 (most compressed) is the most degraded. CYP2C9 (least compressed relative to its baseline) is the one that didn't degrade. So far, so consistent. 

But then there's CYP3A4. It was the *least* compressed of the three ensembled isoforms, yet it still declined by about as much as CYP1A2 (the *most* compressed). It's a real trend, but clearly not the dominant mechanism.

## The capped fix: better in three places, worse in one

Notebook 08's exhaustive same-data selection is exactly the overfitting risk Caruana et al.'s 2004 ensemble-selection paper warns about.<sup>2</sup> I tried their proposed mitigation—bagged selection over random library subsets—against a wider 11-config pool. Uncapped, it made spread compression worse across every isoform. 

The fix was applying a size cap, chosen based on where CV ST-RAE actually stopped improving, rather than picking a number in advance:

![Marginal CV ST-RAE as members are added one at a time, four isoforms](/assets/img/posts/marginal_value_by_isoform.png)
*Cumulative CV ST-RAE as members are added in weight-descending order. CYP2C9 and CYP3A4 show a genuine interior minimum, more members make CV ST-RAE measurably worse, not just flat.*

![Bar chart of prediction spread: training-true, 10c, and notebook 12's capped Caruana submission, per isoform](/assets/img/posts/spread_comparison.png)
*Prediction spread per isoform: training-true (green), 10c's single-model control (blue), the previous uncapped submission (orange), and notebook 12's capped version (red). Capping widened spread on every isoform, but red still sits below blue everywhere.*

Capping did what it was meant to do on CV, and on two isoforms' blind results. CYP1A2 improved (still worse than `04b`), and CYP2C9 hit its best result across all four submissions (0.5375). CYP2D6 improved slightly relative to NB10, but it's still much worse than the single model. (Keep in mind, CYP2D6's candidate pool didn't have access to the tuned/residual-excluded variants, so this wasn't a fair test of what a properly equipped CYP2D6 ensemble could do).

**But CYP3A4 got worse.** It dropped from 0.525 under NB10 to 0.610 under the capped fix—its worst result yet. Unlike CYP2D6, there's no known confound hiding here. It's just a real, unexplained regression introduced by the fix.

## Where this leaves things

We have one clean win: CYP2C9 has steadily improved across all four submissions right now. CYP2D6 is still broken after two ensembling methods, though we know it was handicapped by a weak candidate pool. CYP3A4 actually got worse with the fix, and we don't know why yet. 

Underneath it all sits a genuinely surprising pattern: for a well-behaved single model, this blind test set seems easier than cross-validation predicted. Nothing here is settled.

---

## References

1. SuperCowPowers, The CYP Challenge — Working Notes, *ADMET Workbench*, <https://supercowpowers.github.io/workbench/blogs/cyp_challenge/>, (accessed 03 September 2026).
2. R. Caruana, A. Niculescu-Mizil, G. Crew and A. Ksikes, Ensemble Selection from Libraries of Models, *Twenty-First International Conference on Machine Learning (ICML '04)*, ACM Press, Banff, Alberta, Canada, 2004, p. 18.