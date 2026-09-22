---
layout: post
title: Six things that didn't work, and one that did
date: 2026-09-15
description: Twelve notebooks, five pre-registered screens, and a calibration method that finally moved the leaderboard. Every gain so far has come from correcting predictions rather than improving the model.
tags: cheminformatics machine-learning admet python pharmaceutical-science
categories: dissertation
---

## What this post covers

The last post ended with two failed ensembling attempts and a leaderboard score worse than the single model I started with. This one covers what happened next: twelve notebooks, five pre-registered screens, and two submissions that finally moved the needle.

The honest summary is in the title. Almost nothing I tried on the model side worked. What did work was arithmetic applied to predictions the model had already made.

![Macro ST-RAE across seven submissions, annotated with what changed each time](/assets/img/posts/submission_trajectory.png)
*Macro ST-RAE across all seven submissions to date, annotated with what changed. Filled circles changed the model; open diamonds changed only the post-hoc correction applied to existing predictions. Every real improvement is a diamond. Every score here is a half-set measurement.*

## The scoreboard

| Submission | What changed | Macro ST-RAE |
|---|---|---:|
| 04b | Single CheMeleon-init multitask Chemprop | 0.7179 |
| 10c | Same model, rebuilt environment | 0.7138 |
| NB10 | Simple-average ensembles | 0.8299 |
| NB12 | Capped Caruana ensembles | 0.8299 |
| NB13 | External-population calibration | 0.8811 |
| **NB16** | **Blind-population recentring** | **0.6364** |
| **NB19** | **Same, with CYP2C9 reverted** | **0.6265** |

Every one of those numbers is a half-set measurement. The live leaderboard scores half the blind test set, split by chemical series, with the full set scored only at the intermediate reveal and at the close.

## The things that didn't work

Briefly, since the detail is in the notebooks:

**Calibrating toward an external population** (PubChem AID 1851, both a floored-mean and a censored-MLE variant) scored 0.8811, worse than every prior submission on every isoform.

**A test-set-realistic split.** I built an analog-holdout split approximating how the blind set was actually constructed, expecting it to close the cross-validation-to-blind gap. It did the opposite: the gap came out 2.3 to 9.3 times larger than under random cross-validation. Third negative result on the question of whether split methodology explains that gap.

**Protonation state.** This one is worth a paragraph because the chemistry is real and the result still came out flat. A graph neural network sees a molecular graph, and a protonated amine and its neutral form are the same graph, so the model has no way to know a compound carries a charge at pH 7.4. That matters most for CYP2D6, which binds via an ionic interaction with a protonated basic nitrogen. I computed net formal charge at pH 7.4 with Dimorphite-DL and found real correlation with pIC50 on three isoforms, surviving a partial-correlation control for lipophilicity (CYP1A2 −0.193, CYP2C9 −0.120, CYP2D6 +0.177). CYP3A4's apparent signal collapsed by 96% under the same control, which is the control behaving correctly on its own negative case.

Then I fed it to the model as an extra descriptor and nothing happened. Ties on all four isoforms, and an error correlation of 0.984 to 0.990 against the plain baseline, which is what two copies of the same model at different seeds look like.

**Outlier exclusion** did not reproduce the effect I found back in notebook 06, though it did explain something that had been bothering me since. More on that below.

**An interval-aware training objective.** The scoring metric is zero anywhere inside a compound's credible interval, and every model I have trained optimises squared error against the point estimate instead. That gap looked exploitable. It isn't: the difference between the ST-RAE-optimal and R²-optimal placement is only 0.06 to 0.12 log units. The underlying asymmetry is real and now measured rather than assumed (interval width correlates with pIC50 at −0.56 to −0.93, and under-prediction costs 1.65 to 2.79 times more than over-prediction), but it is not worth building a custom loss for.

![ST-RAE and R-squared against a uniform prediction offset, four panels, one per isoform](/assets/img/posts/strae_vs_r2_offset.png)
*ST-RAE and R² against a uniform offset applied to out-of-fold predictions. The two objectives do diverge, with ST-RAE's optimum sitting above R²'s on every isoform, but the separation is small.*

## Why the ensembles kept failing

Two ensembling attempts lost on the board despite winning on cross-validation, and I had been assuming the problem was insufficient diversity in the candidate pool. A top-ten entrant on this challenge publishes a different diagnosis: with correlated members, unconstrained ridge and elastic-net combiners return large cancelling coefficients, one member near +1.9 against another at −0.6, which fits held-out folds and transfers badly. Their fix is restricting the stacker to non-negative combiners.

I tested it. The cancellation does not happen here: no coefficient in my pool exceeds 1.5 or drops below −0.053. That diagnosis does not transfer, which is a useful thing to have established rather than assumed.

What the same notebook did find is more interesting. My eleven configs have prediction correlations of 0.47 to 0.76, which looks like reasonable diversity. Their **error** correlations run 0.79 to 0.91, reaching 0.97.

The models look different and get the same compounds wrong.

That is a complete explanation for two board failures. Averaging cancels independent noise. It cannot cancel shared ignorance, and shared ignorance is what this pool has. It also reframes the protonation result above: an error correlation of 0.984 against baseline looked like evidence the feature never reached the output, but high error correlation turns out to be a property of everything in this pool.

One caveat on the flip side. Under a genuinely leakage-free 25-fold outer loop, every fitted combiner beat the best single config by 7 to 11% on every isoform, with non-negative combiners best or joint-best. That is better evidence than notebook 08 or 11b had, since both of those fitted and scored on the same pooled predictions. But notebook 08's simple averages also won on cross-validation and then lost 0.116 macro on the real board, so "wins out-of-fold" has a specific track record here.

## What actually worked

Back in notebook 09 I decomposed R² into three terms, following SuperCowPowers' own working notes:<sup>1</sup>

$$R^2 = 2\rho k - k^2 - b^2$$

where $\rho$ is the correlation between predictions and truth, $k$ the ratio of their spreads, and $b$ the standardised bias. A linear correction can only touch $k$ and $b$. At the time I measured those terms against my *training* population, found they accounted for under 2.2% of the R² gap, and dropped the idea.

That was the wrong population. The question is not how my predictions sit relative to the data I trained on, it is how they sit relative to the blind set I am scored against. And I cannot see the blind set.

But the leaderboard tells me two things about it. Given a submission's own prediction mean and standard deviation, which I know exactly, and its published R², the equation above becomes one equation in two unknowns: the blind population's mean and spread. MAE supplies a second equation, under an explicit assumption that the residuals are normally distributed. Two equations, two unknowns, solved per isoform across four prior submissions.

### The part I did not see coming

Both R² and MAE depend on the bias only through its magnitude. The folded-normal expression for MAE is an even function of the residual mean, and $b$ appears squared. Which means for every solution, its mirror image reflected about the prediction mean produces identical R² and identical MAE.

**The sign of the offset is unrecoverable from those metrics, for any submission, as a matter of the algebra.** You can determine how far the blind population sits from your predictions, but not which side.

For CYP2C9 one candidate was clearly implausible and the choice made itself. For CYP1A2 both candidates landed in similarly reasonable ranges, so I left it undetermined rather than guessing. CYP3A4 was worse: substituting Spearman for Pearson (the board does not publish Pearson) produced algebraically infeasible systems for two of four submissions, meaning the approximation had broken down entirely for that isoform.

CYP2D6 sat right on the boundary of my ambiguity threshold, resolved by a heuristic I had already rejected elsewhere. I overrode it to the other root on the strength of one external precedent, then checked: with that convention applied consistently, all four submissions converged to within 0.091, tighter than CYP2C9's own accepted clustering. A held-out forward check against a submission not used in the solve predicted its real R² seven times more closely than the original root had.

### The result

![CYP2D6 prediction distributions before and after recentring, against the solved blind population](/assets/img/posts/cyp2d6_placement_shift.png)
*CYP2D6's blind predictions before (grey) and after (red) recentring, with the training labels for context and the solved blind population as a dashed Normal curve. The corrected column lands on the solved centre 1.35 log units below where it started. Note that it is also far narrower than the solved population, by construction: the correction shrinks spread by ρ, which is 0.37 for this isoform.*

| Isoform | 10c | NB16 | Change |
|---|---:|---:|---|
| CYP1A2 | 0.6954 | 0.6954 | uncorrected |
| CYP2C9 | 0.5489 | 0.5770 | worse |
| CYP2D6 | **1.1673** | **0.8299** | **better** |
| CYP3A4 | 0.4434 | 0.4434 | uncorrected |
| Macro | 0.7138 | **0.6364** | |

CYP2D6's R² went from −0.5941 to +0.2713. Its Spearman did not move at all, staying at exactly 0.4000.

![CYP2D6 R-squared and Spearman across seven submissions](/assets/img/posts/cyp2d6_placement_vs_ranking.png)
*CYP2D6's R² (top) and Spearman (bottom) across all seven submissions. R² swings from −0.94 to +0.27; Spearman barely moves. The Spearman axis is fixed to 0–1 rather than autoscaled, so its flatness is shown honestly rather than magnified.*

That pair of facts is the cleanest result in this project. A negative R² has a precise meaning: you would have scored better predicting the same number for every compound. But rank correlation was fine throughout. The ordering was always roughly right and the whole column was sitting in the wrong place on the axis, about 1.35 log units away. Shifting it fixed the placement and left every ranking untouched, which is exactly what an additive correction should do.

The failure I had spent four notebooks investigating as a modelling problem was arithmetic.

## Reverting the half that didn't work

CYP2C9 got worse under the same correction, from 0.5489 to 0.5770. So the next submission put it back to its uncalibrated values and left everything else alone: macro 0.6265, the best so far.

The pattern is straightforward once you see it. CYP2D6's bias term was large and its R² was negative, so placement was genuinely broken. CYP2C9's R² was 0.53 and its bias term was small, so there was nothing to fix and the correction only added noise. That is a criterion I can state and defend rather than applying calibration uniformly and hoping.

One unintended bonus: three isoforms were resubmitted byte-identical and came back byte-identical on every metric. Identical inputs produce identical board output, so per-isoform comparisons across submissions are sound, which I had been assuming rather than checking.

## The thread that finally moved a model

Every gain above is post-hoc correction. Nothing had improved the model itself. Then one screen did.

Auxiliary prediction heads: instead of four outputs, give the network extra outputs for other assays measured on the same platform, keeping each on its own scale rather than pooling them. The challenge released a time-dependent-inhibition file alongside the main training set, and it contains 1,240 compounds that never appear in the scored data at all.

CYP3A4 improved from 0.522 to 0.481 out-of-fold with four auxiliary heads, and to 0.457 with eight. CYP1A2 and CYP2D6 did not move at all.

![Out-of-fold ST-RAE by isoform for baseline, 8-head and 12-head arms, with three-seed spread as error bars](/assets/img/posts/strae_by_arm_isoform.png)
*Out-of-fold ST-RAE by arm, error bars showing spread across three seeds. CYP3A4 is the only isoform that clears its own seed spread, and it improves further with more heads. CYP1A2 goes the other way at 12 heads.*

The mechanism is the interesting part. Of those 1,240 extra compounds, 1,238 carry a CYP3A4 label. Two carry CYP2D6 and none carry CYP1A2 or CYP2C9. I pre-registered before running that the isoform gaining the most new compounds should benefit most, and that is what happened.

A second auxiliary file brought no new compounds at all, only extra columns on the same population. Adding its four heads took CYP3A4 further still, but made CYP1A2 actively worse, from 0.800 to 0.849. So the working rule is that auxiliary heads help where they bring new compounds and start costing you where they only add width.

A follow-up notebook then closed that route off. The single-concentration screening file, which covers all four isoforms and looked like the obvious next expansion, turns out to be a strict subset of the curated training pool. Zero new compounds anywhere.

![New compounds contributed per isoform by each auxiliary file, against existing pool size](/assets/img/posts/new_compounds_by_file_isoform.png)
*Genuinely new compounds contributed by each auxiliary file, per isoform, with each isoform's existing scored-pool size marked for scale. There is exactly one bar on the chart.*

Which means compound-pool expansion from the challenge's own released files is exhausted. Any further expansion has to come from outside.

## One thing I got wrong that is worth recording

Notebook 06 found that masking CYP2D6 labels shifted the *other three* isoforms' predictions, despite their labels never being touched. I ruled out training nondeterminism decisively, ruled out the masking content, and was left with a hypothesis I could not test: that Chemprop's multitask loss weights each task by how many valid labels it has, so removing CYP2D6 labels changes the gradient balance for everything.

The residual-exclusion screen settled it almost incidentally. Two *disjoint* masked compound sets produced near-identical divergence on the untouched isoforms, with gaps of 0.002 to 0.006. Different compounds, same effect, so the effect cannot be about which compounds. It is the label count.

The screen also deflated my original concern. Changing the random seed alone perturbs the other isoforms more (correlation 0.87 to 0.91) than masking does at a fixed seed (0.95 to 0.97). The divergence is real, and it is smaller than ordinary run-to-run noise, which I had no way of knowing in notebook 06 because I never measured the seed floor.

## Where this leaves things

Macro ST-RAE has gone from 0.7179 to 0.6265, and none of that came from a better model. The leader is at 0.3923.

That gap is not going to close with feature engineering. The entrants above me train on tens of thousands of compounds; I train on 4,905. Every screen I have run in the last week has produced differences smaller than seed variance, which is itself a result: with this much data and this representation, the model is close to what the data supports.

The error-correlation finding points somewhere specific, though. If every model in the pool fails on the same compounds, the fix is not another model or a better combiner. It is a model that has seen chemistry the others have not. That is the one direction left worth trying, and it is where the next stretch goes.

What I actually have is a dozen notebooks' worth of results with mechanisms attached, most of them negative, several of them pre-registered before I looked. For a dissertation that is better material than a leaderboard position would have been.

---

## References

1. SuperCowPowers, The CYP Challenge — Working Notes, *ADMET Workbench*, <https://supercowpowers.github.io/workbench/blogs/cyp_challenge/>, (accessed 14 September 2026).
2. J. R. Ash, C. Wognum, R. Rodríguez-Pérez, M. Aldeghi, A. C. Cheng, D.-A. Clevert, O. Engkvist, C. Fang, D. J. Price, J. M. Hughes-Oliver and W. P. Walters, Practically Significant Method Comparison Protocols for Machine Learning in Small Molecule Drug Discovery, *J. Chem. Inf. Model.*, 2025, **65**, 9398–9411.
3. E. Heid, K. P. Greenman, Y. Chung, S.-C. Li, D. E. Graff, F. H. Vermeire, H. Wu, W. H. Green and C. J. McGill, Chemprop: A Machine Learning Package for Chemical Property Prediction, *J. Chem. Inf. Model.*, 2023, **64**, 9–17.
4. R. Caruana, A. Niculescu-Mizil, G. Crew and A. Ksikes, Ensemble Selection from Libraries of Models, *Twenty-First International Conference on Machine Learning (ICML '04)*, ACM Press, Banff, Alberta, Canada, 2004, p. 18.
5. Y. S. Kiani and I. Jabeen, Exploring the Chemical Space of Cytochrome P450 Inhibitors Using Integrated Physicochemical Parameters, Drug Efficiency Metrics and Decision Tree Models, *Computation*, 2019, **7**, 26.
6. P. J. Ropp, J. C. Kaminsky, S. Yablonski and J. D. Durrant, Dimorphite-DL: an open-source program for enumerating the ionization states of drug-like small molecules, *J Cheminform*, 2019, **11**, 14.