---
layout: post
title: The hard compounds are ordinary
date: 2026-09-17
description: Characterising the compounds all eleven models get wrong, finding regression to the mean underneath, and testing a spread correction on the real leaderboard.
tags: cheminformatics machine-learning admet python pharmaceutical-science
categories: dissertation
---

## What this post covers

The last post ended with a plan. If every model in my pool fails on the same compounds, the way
forward is a model that has seen chemistry the others have not, which meant building a retrieved
corpus of unlabelled near-neighbours of the blind set and pretraining the encoder on it. That is
expensive, so before building it I checked whether the compounds I actually fail on are the kind
of compounds such a corpus would contain.

They are not. This post covers that check (notebook 25), what the failures turned out to be
instead (26), and the submission that came out of it (27). Every score below is a half-set
measurement.<sup>1</sup>

## Who the models get wrong

I defined three populations from the pooled out-of-fold predictions of all eleven configs, and
froze the definitions to disk before computing a single chemical property, so the chemistry could
not be fitted to the answer.<sup>2</sup>

- **Consensus-hard**: worst decile by mean soft-threshold error across all eleven configs.
- **Consensus-easy**: best decile by the same measure, as the contrast set.
- **Disagreement**: worst decile by standard deviation of signed error across the eleven configs.

Each compound is held out once per repeat, so errors are averaged over a compound's five repeats
per config first. That separates a compound that gets mispredicted consistently by independently
trained models from one that a single unlucky fold happened to miss.

The test that mattered is nearest-neighbour Tanimoto similarity to the training set, hard against
easy. The expectation going in came from the activity-cliff literature, where the compounds that
break structure-activity models are the ones whose near neighbours carry very different
activity.<sup>3,4</sup>

![Nearest-neighbour Tanimoto similarity to training, consensus-hard vs consensus-easy, per isoform](/assets/img/posts/hard_vs_easy_nn_similarity.png)
*Nearest-neighbour similarity to the training set for the hardest and easiest deciles, per
isoform, medians dashed. The two distributions sit on top of each other everywhere.*

Hard-set median similarity is 0.40, 0.44, 0.36 and 0.45 across CYP1A2, CYP2C9, CYP2D6 and CYP3A4.
The easy-set medians are 0.39, 0.44, 0.36 and 0.45. Rank-biserial effect sizes run 0.02 to 0.09
and none survives Benjamini-Hochberg correction on any isoform.

The compounds this pool fails on are exactly as well supported by nearest-neighbour structure as
the compounds it gets right. A corpus built to cover structurally under-sampled territory would
be aimed at a problem I do not have, so I did not build it. The check cost one read-only notebook
and saved whatever the corpus would have cost.

## What does separate them

Something had to distinguish the hard set, and on three isoforms it does. Hard compounds sit at
higher measured pIC50, inside narrower credible intervals, with higher Crippen logP and lower
FractionCSP3 than easy ones. That direction is consistent with the physicochemical profile
repeatedly reported for CYP450 inhibitors, where lipophilicity and low sp3 character track
inhibition across isoforms.<sup>5,6</sup> CYP3A4 adds lower TPSA, higher heavy-atom count and a
small enrichment of ring-free compounds (4 of the 6 acyclic compounds in its pool are hard, odds
ratio 18.3, on an n small enough to say so out loud). CYP1A2 has nothing: no property tested
separates its hard set by a material margin, so its difficulty is genuinely diffuse on this
evidence.

Narrow intervals are partly mechanical, since the soft-threshold rule that defines hardness here
is harder to satisfy when the tolerance band is tight. Potency is not mechanical, and it points
somewhere specific.

The other half of the notebook asked whether being hard and being disputed are the same thing.

![Compound difficulty against cross-model disagreement, per isoform](/assets/img/posts/difficulty_vs_disagreement.png)
*Mean soft-threshold error against the standard deviation of signed error across the eleven
configs. Consensus-hard compounds (red) sit far to the right without sitting higher.*

Spearman between difficulty and disagreement is 0.20, 0.25, 0.18 and 0.07 across the four
isoforms, and the two sets overlap by only 11 to 19% of members. Being wrong and being disputed
are largely independent populations here.

That is the compound-level counterpart to the error-correlation result from the last post. Model
averaging works by cancelling the part of each member's error that the others do not
share.<sup>7,8</sup> If the models disagreed about the compounds they get wrong, averaging would
have something to cancel. They agree, confidently, on the same wrong answers.

## The sign of the errors

Hard compounds being systematically more potent has an obvious candidate mechanism that nothing
in this project had checked directly: a model whose predictions are compressed toward the mean
will under-predict the potent tail hardest. Two prior findings are consistent with it. Under the
scoring metric, under-prediction costs 1.65 to 2.79 times more than over-prediction of the same
magnitude, and every submitted prediction distribution has a standard deviation below the
training-label standard deviation on every isoform.

So I binned every compound by measured potency and looked at the sign.

![Mean signed error by measured-potency decile, per isoform](/assets/img/posts/signed_error_by_potency_decile.png)
*Mean signed error (prediction minus true pIC50) by potency decile, all compounds. Red bars are
under-predictions. One sign crossing per isoform, in the same place each time.*

Textbook regression to the mean on all four isoforms. The lowest-potency decile is over-predicted
by 1.11 to 1.88 pIC50 units, the trend is monotonic, and the highest-potency decile is
under-predicted by 0.95 to 1.37. Between 64% and 93% of each hard set carries a negative signed
error, all BH-significant against the easy set.

The compounds notebook 25 found hardest are the compounds sitting where the compression bites
hardest. That is one mechanism, not two findings.

## Is rho the right amount of shrinkage?

The calibration this project already deploys shrinks prediction spread by rho, the correlation
between predictions and truth. That factor is provably optimal under squared error. The
competition does not score squared error. Nobody had checked whether the two agree.

I swept a pure spread multiplier, holding each isoform's prediction mean fixed, and scored every
step through the unmodified evaluator. Spearman is asserted unchanged at three widely separated
multipliers first, since scaling around a fixed centre cannot reorder anything and a failure
there would mean the bug was mine.

![Out-of-fold ST-RAE against a pure spread multiplier, per isoform](/assets/img/posts/strae_vs_spread_multiplier.png)
*Out-of-fold ST-RAE against a spread multiplier, mean held fixed. Dashed lines mark the raw
predictions (s = 1) and the rho-shrinkage this project applies. The black dot is the ST-RAE
optimum.*

The optimum sits between rho and 1.0 on every isoform, closer to rho than to raw but never at it:
0.66 against rho 0.50 for CYP1A2, 0.82 against 0.65 for CYP2C9, 0.48 against 0.37 for CYP2D6,
0.91 against 0.75 for CYP3A4. The gap is 0.11 to 0.17 multiplier units every time.

Rho-shrinkage over-shrinks relative to what ST-RAE actually rewards, consistently, on all four.
The absolute cost of using rho instead of the true optimum is small, 0.004 to 0.015 ST-RAE units,
which is the same order as the headroom the offset sweep found. One honest asymmetry: CYP2C9's
stored rho was fitted on the capped Caruana ensemble<sup>9</sup> rather than the model whose curve
is plotted here, so its comparison point is not quite like the other three.

Sweeping offset and spread jointly showed the two corrections interact slightly on CYP1A2,
CYP2D6 and CYP3A4 (0.006, 0.003 and 0.008 ST-RAE units left on the table by optimising them
separately) and are exactly separable on CYP2C9.

All of this is measured on out-of-fold data, and out-of-fold ST-RAE is known to be an unreliable
guide for CYP2D6 specifically. Resampled cross-validation estimates carry no unbiased variance
estimator to begin with,<sup>10</sup> and here the problem is worse than variance: the recentring
that took CYP2D6 from 1.1673 to 0.8299 on the real board scores 3.08 on the out-of-fold curve,
roughly three times the raw baseline, because the two populations have different centres. A
CYP2D6-only sweep against the solved blind population instead disagrees with the out-of-fold
answer. I reported both side by side rather than averaging two answers to different questions.

## Compression against the real board

Another entrant on this challenge, running under the name 450 nm, publishes a live operating
dashboard of their own work, and it carries per-isoform evidence that their board ST-RAE is rank
ordered by how compressed each submitted column was against the training-label spread.<sup>11</sup>
Their widest column, at 1.15 times training spread, scored 0.5087. Their narrowest, at 0.26 times,
scored 1.794, which is worse than predicting a constant. It points the same way as SuperCowPowers'
independently reported observation that the true blind population is wider than the training data
on every isoform,<sup>12</sup> which means a column narrower than training spread is narrower still
relative to the population it is actually scored against.

That is board evidence for the same phenomenon I had been measuring out-of-fold, and it implies a
much larger effect. So I measured my own seven submitted files the same way, joined each column to
its published score, and plotted all 28 points against their four.

![Spread ratio against board ST-RAE, 28 own submission-isoform points plus one external entrant's four](/assets/img/posts/spread_ratio_vs_board_strae.png)
*Prediction spread relative to training-label spread against board ST-RAE. Coloured points are
this project's own seven submissions across four isoforms; crosses are the external entrant's own
four.*

Pooled, the association is real and reasonably tight: Spearman −0.822, bootstrap 95% CI −0.888 to
−0.662 over 28 points, in the same direction as the external claim.

Per isoform it mostly falls apart, and the naive p-values flatter it. CYP1A2's rho of exactly
−1.0 is an artefact: only 5 of its 7 submissions carry a distinct prediction column, so
resampling from five clusters reproduces the same perfect order almost every draw and the
bootstrap CI comes back degenerate at −1.0 to −1.0. CYP3A4's CI runs −1.0 to 0.125, wide enough
to contain zero. CYP2C9 and CYP2D6 are not significant at all. The only robust evidence in my own
data is the pooled correlation.

The confound is worth stating plainly too. Those seven submissions differ in ensembling, in
environment, and in three separate calibration mechanisms, not only in spread. Several columns'
ratios moved because a modelling decision changed, not because anything targeted spread. This is
an observational association consistent with the compression hypothesis, not a demonstration of
it.

My own current submission's ratios: CYP3A4 0.933, CYP1A2 0.836, CYP2C9 0.817, and CYP2D6 at
0.608, 39% narrower than its training spread and the clear outlier of the four. CYP2D6 is also
the most compressed and worst-scoring isoform in both sources.

## The widening test

On cleanliness grounds CYP1A2 was the better candidate, since its column has been carried through
byte-identical since the control run and has never been touched by a correction. I went with
CYP2D6 anyway, because it is the only isoform whose compression is genuinely out of line with the
rest and because four separate lines of evidence point the same way there: the ratio itself, the
regression-to-the-mean signature, the asymmetric cost of under-prediction, and the external
entrant's own worst-scoring point.

One line of evidence points the other way, and I want it on the record rather than omitted. My
own out-of-fold sweep says CYP2D6 wants *more* shrinkage, s = 0.48. I discounted that on a
judgement, not a certainty: out-of-fold ST-RAE has already been shown to be invalid for this
isoform, and if I had trusted it literally then the recentring that produced this project's
biggest real win would never have been attempted. This is a test of which evidence source is
right for CYP2D6, not a confident correction.

The transform scales CYP2D6's spread by 1.3971 about its own mean, landing the ratio at 0.85, in
line with the other three isoforms and deliberately short of 1.0. The other three columns are
carried over byte-identical.

![CYP2D6's submitted column before and after widening, against the training-label spread](/assets/img/posts/cyp2d6_widened_distribution.png)
*The submitted CYP2D6 column (grey) and the widened one (red). The shaded band is the
training-label spread, re-centred on the two histograms' shared mean so it compares width only.
Even after widening, the red distribution is narrower than the band.*

Because a positive spread scale about a fixed mean is a strictly increasing map, it cannot
reorder anything, which gives a prediction that can fail. Before submitting, I wrote down that
CYP2D6's board Spearman and Kendall should come back at exactly 0.4000 and 0.2747, unchanged, and
that the other three isoforms should reproduce on every metric. If any of that moved, something
other than the intended transform had happened and nothing else about the result could be
trusted.

## The result

| Isoform | Previous best | Widened | Change |
|---|---:|---:|---|
| CYP1A2 | 0.6954 | 0.6954 | unchanged, as predicted |
| CYP2C9 | 0.5375 | 0.5375 | unchanged, as predicted |
| CYP2D6 | **0.8299** | **0.7858** | **better** |
| CYP3A4 | 0.4434 | 0.4434 | unchanged, as predicted |
| Macro | 0.6265 | **0.6155** | |

Best macro to date. CYP2D6's Spearman and Kendall came back at 0.4000 and 0.2747, and the three
untouched isoforms reproduced on every metric, which is the second time byte-identical
resubmission has confirmed the board scores deterministically.

Both halves of the prediction held, which is what makes the improvement interpretable. The gain
came from the spread of a column whose ordering never changed, on the isoform where the ordering
was already known to be roughly right and the placement known to be wrong. Every move that has
worked on this project so far has that shape.

## Where this leaves things

A month ago I would have said the way to improve CYP2D6 was a better CYP2D6 model. Three separate
corrections later, all of them arithmetic applied to predictions already made, it is at 0.7858
from a starting point of 1.1903, and not one of those corrections changed a single prediction's
rank.

The uncomfortable part is that the thing I keep correcting is the same thing every time. The
models compress toward the mean, the metric punishes under-prediction harder than
over-prediction, and the potent compounds pay for both. Recentring, then widening, are two ways
of paying that back after the fact.

Which leaves the question the retrieved corpus was supposed to answer still open, and now with
one route closed off by evidence rather than by cost. If the failures are ordinary compounds that
every model agrees about and gets wrong in the same direction, the information that would fix
them has to come from outside this dataset, and it has to be information about the compounds
rather than about the chemical space around them. Multitask pretraining on external
bioactivity data is the established route for exactly that shortage,<sup>13,14</sup> with the
standing caution that potency values aggregated across assays and laboratories carry substantial
noise of their own.<sup>15</sup>

---

## References

1. OpenADMET CYP Blind Challenge, Hugging Face Space, <https://huggingface.co/spaces/openadmet/cyp-challenge>, (accessed 18 August 2026).
2. J. R. Ash, C. Wognum, R. Rodríguez-Pérez, M. Aldeghi, A. C. Cheng, D.-A. Clevert, O. Engkvist, C. Fang, D. J. Price, J. M. Hughes-Oliver and W. P. Walters, Practically Significant Method Comparison Protocols for Machine Learning in Small Molecule Drug Discovery, *J. Chem. Inf. Model.*, 2025, **65**, 9398–9411.
3. D. Van Tilborg, A. Alenicheva and F. Grisoni, Exposing the Limitations of Molecular Machine Learning with Activity Cliffs, *J. Chem. Inf. Model.*, 2022, **62**, 5938–5951.
4. R. Guha and J. H. Van Drie, Structure−Activity Landscape Index: Identifying and Quantifying Activity Cliffs, *J. Chem. Inf. Model.*, 2008, **48**, 646–658.
5. Y. S. Kiani and I. Jabeen, Exploring the Chemical Space of Cytochrome P450 Inhibitors Using Integrated Physicochemical Parameters, Drug Efficiency Metrics and Decision Tree Models, *Computation*, 2019, **7**, 26.
6. T. C. Beck, K. R. Beck, J. Morningstar, M. M. Benjamin and R. A. Norris, Descriptors of Cytochrome Inhibitors and Useful Machine Learning Based Methods for the Design of Safer Drugs, *Pharmaceuticals (Basel)*, 2021, **14**, 472.
7. T. G. Dietterich, in *Multiple Classifier Systems*, Springer Berlin Heidelberg, Berlin, Heidelberg, 2000, vol. 1857, pp. 1–15.
8. B. Lakshminarayanan, A. Pritzel and C. Blundell, Simple and Scalable Predictive Uncertainty Estimation using Deep Ensembles, in *Advances in Neural Information Processing Systems*, Curran Associates, Inc., 2017, vol. 30.
9. R. Caruana, A. Niculescu-Mizil, G. Crew and A. Ksikes, Ensemble Selection from Libraries of Models, in *Twenty-First International Conference on Machine Learning (ICML '04)*, ACM Press, Banff, Alberta, Canada, 2004, p. 18.
10. Y. Bengio and Y. Grandvalet, No Unbiased Estimator of the Variance of K-Fold Cross-Validation, *J. Mach. Learn. Res.*, 2004, **5**, 1089–1105.
11. 450 nm, *CYP Campaign: OpenADMET Blind Challenge*, operating dashboard, <https://openadmet-cyp-dashboard.vercel.app/operating_dashboard>, (accessed 20 September 2026).
12. SuperCowPowers, The CYP Challenge — Working Notes, *ADMET Workbench*, <https://supercowpowers.github.io/workbench/blogs/cyp_challenge/>, (accessed 3 September 2026).
13. N. J. Wichrowski, M. V. Clemens-Sewall, K. K. Rao, C. Richardson, N. Q. Le, P. T. Koshute, J. Y. Liu, Y. Chushak, J. P. Coyle, T. R. Sterner and R. A. Clewell, Multitask Pretraining Framework for Improving Predictivity of Machine Learning Chemical Bioactivity Models for Low-Data Endpoints, *Chem. Res. Toxicol.*, 2026, **39**, 722–733.
14. L.-H. Dinh Pham, M.-T. Le and K.-M. Thai, Improved ADME Prediction by Multitask Pretraining on Predicted Data: Insights from the ASAP-Polaris-OpenADMET Blind Challenge, *J. Chem. Inf. Model.*, 2026, **66**, 395–405.
15. G. A. Landrum and S. Riniker, Combining IC50 or K<sub>i</sub> Values from Different Sources Is a Source of Significant Noise, *J. Chem. Inf. Model.*, 2024, **64**, 1560–1567.