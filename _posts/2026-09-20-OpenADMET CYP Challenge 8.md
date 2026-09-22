---
layout: post
title: Four confirmations, four board failures
date: 2026-09-20
description: External training data, a dead-zone training target, two full-data retrains that lost on the board, and the correction that turned one of them into the best submission so far.
tags: cheminformatics machine-learning admet python pharmaceutical-science
categories: dissertation
---

## What this post covers

Two modelling ideas, both tested more carefully than anything else in this project, both confirmed
on cross-validation, and both worse than the baseline when they reached the real leaderboard. Then
the part that matters: one of those two failures turned out to be a calibration artefact rather
than a verdict on the model, and correcting for that produced the best submission this project has
made.

Four submissions, macro ST-RAE, every figure a half-set measurement:<sup>1</sup>

| Submission | What it was | Macro |
|---|---|---:|
| NB27-widened | CYP2D6 spread widened, from the last post | 0.6155 |
| NB30 | AID 1851 auxiliary heads, raw, no correction | 0.8160 |
| **27b** | **The same model, CYP2D6 corrected** | **0.5982** |
| NB32-A | Dead-zone target on top of that model | 0.6488 |

## Training on compounds from outside the challenge

Every entrant materially above me trains on more compounds than my 4,905. The auxiliary-head
mechanism from two posts ago pays where it brings new compounds into the shared encoder's pool and
costs where it only adds columns, which is the multitask picture reported elsewhere for ADME
endpoints: extra tasks help most where they supply data a sparse endpoint does not
have.<sup>2,3</sup> The challenge's own released files are exhausted on that front. PubChem AID
1851, an NCATS quantitative high-throughput cytochrome panel covering 17,143 compounds against
five isozymes,<sup>4,5</sup> was already fetched and curated back when I used it as a calibration
target and it failed badly in that role. That failure says nothing about this one. Calibration
asks an external population for a centre; auxiliary heads ask it for gradient signal.

The gate came first: does AID 1851 track my own measured pIC50 on the compounds where both exist?
This matters more than it might sound, because potency values aggregated across different assays
and laboratories carry substantial systematic noise,<sup>6</sup> and AID 1851 is a bioluminescent
assay while the challenge's own data is fluorescence and mass spectrometry. Frozen criteria on
disk before a single correlation was computed. Two things came out of it that I did not expect.

The first is that my own sparse labelling, not the external assay, is the binding constraint. Only
98 compounds overlap, and per isoform only 20 to 49 of those carry a non-null label, because each
isoform column is 26 to 48% populated. The criterion as originally drafted required at least 200
overlapping compounds, which is arithmetically unsatisfiable here. I amended it to n of at least 20
plus a bootstrap confidence requirement, before computing anything, because freezing an
unsatisfiable criterion would have produced a guaranteed fail on sample size rather than evidence
about the assay.

The second is that the curated file I had been carrying since notebook 13 is worse than it looks.
Its potency column exists for every row, but 49.7% of those values are censoring floors rather
than measurements: where no dose-response curve fitted, the value is the top tested concentration.
Every efficacy readout was silently dropped at the aggregation step, and those columns are recorded
at 100% coverage whether or not a curve fitted. They were still sitting in the raw batch files.

That distinction decides the whole exercise. The argument for AID 1851 as training signal is that
it supplies the compounds that did nothing, which my training set lacks by construction because
the organisers promoted only top hits to dose-response. Under the potency readout, most of those
16,459 new compounds arrive carrying one of five repeated floor constants. Under efficacy they
arrive carrying a real graded number.

The potency readout has the higher headline correlation (0.79 on CYP1A2 against efficacy's 0.54),
and it is the one that cleared the frozen gate. It also does not survive a sensitivity check on
half the isoforms: strip the floored values out and CYP2C9's correlation flips sign from +0.35 to
−0.25, and CYP3A4's rests on eight real fits. Efficacy is weaker at its peak but uniform, 0.48 to
0.64 on all four isoforms, every value a measurement. I went with efficacy, and recorded the prior
pointing the other way: the Emax arm two posts ago was also an efficacy-type readout and it hurt
CYP1A2.

![AID 1851 auxiliary heads against baseline, single fold, three seeds](/assets/img/posts/aid_screen_single_fold.png)
*Single-fold screen, three seeds, held-out ST-RAE. All four isoforms move the right way; two
resolve against the frozen rule.*

All four isoforms improved, two of them resolving as genuine improvements against the frozen
threshold, with CYP1A2's three AID seeds sitting entirely below its three baseline seeds. Every
secondary metric moved the same way on every isoform. After eight screens that came back flat or
below seed noise, this was the first resolved improvement the project had produced.

It was also one fold.

## Confirming it properly

Twenty-five folds, two arms, one seed per fold taken from the frozen manifest so the numbers stay
comparable with the original CV comparison. Fifty real training runs of a CheMeleon-initialised
directed message-passing network,<sup>7,8</sup> about seventeen hours of compute. Paired tests,
Benjamini-Hochberg corrected,<sup>9</sup> with the homogeneity-of-variance branch checked rather
than assumed, following the comparison protocol this project has used
throughout.<sup>10</sup>

One deliberate change from the screen, and it is a correction rather than a variation. The screen
computed its winsorisation bounds once, on one fold's training portion. Carrying those fixed values
across 25 folds would clip 24 of them using bounds computed partly from their own held-out
compounds. Small, but a leak, and the kind that is easy to miss because nothing about it looks like
a train-test overlap.<sup>11</sup> Recomputed per fold, the bounds barely move, which makes the
size of the avoided leak visible instead of assumed.

![AID arm against baseline, paired by fold, all 25 folds](/assets/img/posts/aid_cv_paired_by_fold.png)
*Each line is one fold, baseline to AID arm. Black is the mean. CYP1A2 and CYP2D6 carry the
effect; CYP2C9 and CYP3A4 do not.*

The screen's headline did not survive. CYP1A2 is significantly better (−0.0462, 95% CI −0.0713 to
−0.0212, p 0.0017 after correction, 20 of 25 folds improving). CYP2D6 is significantly better and
larger still (−0.0670, dz −1.01, p 0.00014, 21 of 25 folds). CYP2C9 and CYP3A4 are
indistinguishable from zero, p 0.507 and 0.179, CIs spanning zero. Two of four verdicts reproduced.

CYP2D6 is the biggest number in the table and the least usable one, for the reason it has always
been: out-of-fold ST-RAE is not a valid selection metric for that isoform, and the board has
contradicted out-of-fold evidence for it twice. Banking the largest effect in the run because it is
the largest is exactly what that caveat exists to prevent.

This is still the strongest modelling evidence this project has produced. A properly powered,
paired, corrected repeated-measures result on the project's own frozen partition, on the first
lever tested here that adds information rather than rearranging it.

## Submitting it raw

The full-data retrain went out uncorrected, deliberately. Every board gain so far has come from
post-hoc correction of the same underlying model's predictions, and both of those corrections were
fitted to that specific model's prediction distribution. A different model produces a different
distribution and neither transfers. Submitting raw is also what makes an honest re-derivation
possible later, since the population solve needs an uncorrected column and its own published
metrics to work from.<sup>13</sup>

Before sending it, I wrote down what should happen and saved it to disk. It should score worse than
the current best, which carries a CYP2D6 correction this one does not. The comparison that actually
tests the model is against the last uncorrected submission of the plain model, macro 0.7138. CYP1A2
and CYP2D6 should improve against it, CYP2C9 and CYP3A4 should be roughly unchanged. And a confirmed
CV gain is not a guaranteed board gain.

One thing the notebook flagged that was not in the plan at all:

![The AID model's raw blind predictions against 10c's, per isoform](/assets/img/posts/aid_raw_vs_10c_spread.png)
*The AID model's raw blind predictions (red) against the plain model's (grey) and the training
labels (shaded). Spread ratios annotated. This model is more compressed on every isoform.*

Spread ratios of 0.685, 0.726, 0.415 and 0.798, against the plain model's 0.836, 0.817, 0.608 and
0.933. More compressed on all four. Given the pooled association from the last post, and the
per-isoform table another entrant publishes on their own operating dashboard showing the same
ordering on their submissions,<sup>12</sup> that is a warning sign, and it was recorded before
submission rather than after.

The board came back at macro 0.8160. Worse than the plain uncorrected baseline on all four
isoforms. It is the largest single-step regression in this project's history, and it followed the
most rigorous confirmation the project has ever run.

The compression signal, available before submission, pointed the right way. The significance tests
carried no information about it at all.

## The part that changes the reading

A raw board score conflates two things. Placement and spread are affine corrections, and affine
corrections cannot change rank order, so Spearman is the one published metric that reports on the
model itself rather than on where its predictions happen to sit.

| Isoform | Plain model | AID model | Direction |
|---|---:|---:|---|
| CYP1A2 | 0.7375 | 0.7466 | slightly better |
| CYP2C9 | 0.7389 | 0.7333 | slightly worse |
| CYP2D6 | 0.4000 | 0.4872 | markedly better |
| CYP3A4 | 0.8177 | 0.7651 | materially worse |

CYP2D6 is a better-ranked model sitting in a badly placed, badly compressed column. That is the
exact failure mode this project has already corrected twice. CYP3A4's ranking is genuinely worse,
and no correction reaches a worse ranking, so CYP3A4 has no case under this model in any form.

That decomposition is what justifies a mixed recipe rather than adopting or discarding the AID
model wholesale. CYP1A2 and CYP3A4 stay on the plain model, CYP2C9 keeps its best column, and
CYP2D6 takes the AID model's column with both corrections applied.

Solving for the blind CYP2D6 population from this submission's own published metrics gave a useful
check as a side effect. The original solve used four submissions of an entirely different model,
two weeks earlier. This one used a single submission of a different architecture. They agree to
0.18% on the mean and 0.05% on the spread, and both sit close to the figure SuperCowPowers report
independently for the same population.<sup>13</sup> Two solves under the same two approximations is
not an independent method, but that convergence is not something a fitted artefact of one model's
errors would produce.

The corrected candidate went out and scored **macro ST-RAE 0.5982**, the best submission this
project has made. CYP2D6's own column came in at 0.7165, better than the plain model's best
corrected result of 0.7858.

Three predictions held. CYP2D6's Spearman and Kendall reproduced the AID model's own raw values
exactly, 0.4872 and 0.3415, because the correction chain is affine. The three carried-over columns
reproduced on every metric. That is the third separate confirmation that identical inputs produce
identical board output, and the third time the rank-preservation prediction has held.

The general lesson is worth stating plainly, because it took a 0.8160 to learn it. **On this
challenge, a raw uncorrected submission is not a fair test of a model.** The raw reading said the
AID architecture was a regression. The corrected reading of the same architecture says the opposite
for the one isoform that differs between them.

## A training target that can reorder

Everything above is either a new model or an affine correction. There is a third category, and it
is the only thing in this project that has moved rank order on purpose.

The scoring metric is zero anywhere inside a compound's published credible band. Every model I have
trained optimises squared error against the point estimate, which spends gradient chasing noise
inside a band where the metric is already indifferent. So: replace the training target with
`clip(oof_prediction, conf_low, conf_high)` under absolute-error loss. A compound the model already
places inside its own band contributes nothing; a compound outside it contributes fully. Because
bands have different widths, this moves compounds by different amounts, which means it can reorder
them.

The target has to come from genuinely out-of-fold predictions or the whole thing collapses into a
model fitting its own overfitted output. The guard that catches that is the hit rate: an in-fold
model would put nearly every training row inside its own band. Measured hit rates were 18 to 42%,
nowhere near it.

![Dead-zone arms against baseline, ST-RAE and Spearman, three seeds](/assets/img/posts/deadzone_strae_and_spearman.png)
*Four arms per isoform: baseline, the loss-function-only diagnostic, the dead-zone target, and
dead-zone plus AID heads. ST-RAE on top, Spearman below with equal prominence.*

The first unanimous clean win in this project's screening history. ST-RAE improves on all four
isoforms, each by 4.5 to 6 times its own baseline seed spread, and Spearman rises on all four too.
Spearman is the finding that matters, because it is the one thing no affine correction in this
project could ever have moved.

Two confounds got flagged in review before that result could be treated as submission-ready, and
both are real.

The dead-zone arm changes two things at once, the loss function and the target. I added a
diagnostic arm afterwards that changes only the loss, which is not blind to the result and is
labelled as such. On every isoform, the loss change alone recovers a substantial share of the gain.
The clipping mechanism still contributes its own effect on top, on three of four isoforms, with
CYP2D6's gain mostly attributable to the loss function alone.

The second confound is fold crosstalk: every dead-zone target came from a donor model that had
itself been trained on this screen's own held-out fold. That is structural, not a bug, and it
plausibly inflates the screen's measured magnitude. It does not apply to a blind submission, since
no donor model has ever seen a blind compound, and it does not affect the direction of the result.

## Not confirming it, and why

I combined the dead-zone target with the AID architecture and retrained on full data without
running a fresh 25-fold confirmation of that specific combination. That is a deliberate deviation
from this project's own standard and I want the reasoning on the record rather than buried.

The AID arm's own confirmation cost about seventeen hours. Confirming the combination would cost
roughly the same again. Against that: the combination rests on one confirmed mechanism and one
screened mechanism, the screen's own magnitude carries the crosstalk caveat above, and by that
point two CV-confirmed results had already reversed on the board, one of them the most rigorous
confirmation the project had run. A 25-fold confirmation had a poor record of predicting transfer
here specifically.

That is a reason to weigh the cost of a further confirmation against its track record, not a reason
to abandon rigour generally. It is still the weakest-evidenced submission this project has sent.

![CYP2D6's correction chain for the dead-zone model](/assets/img/posts/nb32_cyp2d6_correction_chain.png)
*CYP2D6 raw, after placement, and after widening, against the solved blind population. Same recipe
as the two corrections before it, using this model's own out-of-fold rho.*

Two candidates got built. One takes all four columns from the new model, which risks the macro on
an unconfirmed claim but is the only way to learn whether the screen's all-four improvement
transfers. The other keeps three board-validated columns and changes only CYP2D6. I sent the first,
because the second learns nothing about the question the screen actually raised.

It scored macro 0.6488, worse than the corrected AID submission, and worse than the appropriate
per-isoform reference on all four isoforms.

The unsent candidate's score is computable rather than guessable, because it shares the submitted
one's CYP2D6 column byte for byte. It works out at 0.6066, also worse. The submission slot was
correctly not spent on it.

Spearman again separates what happened. CYP1A2's ranking genuinely improved, 0.7375 to 0.7565,
while its ST-RAE got worse, which makes it a placement or spread problem rather than a model
regression on that isoform. CYP2D6's ranking genuinely declined against the plain AID model, 0.4872
to 0.4438, and no correction reaches that.

That is four occasions now where a cross-validated result has failed to transfer to the board.
Ensembles selected on a single CV pass, which is the selection-bias failure mode the ensemble
selection literature warns about directly.<sup>14</sup> A single-fold screen whose verdict did not
survive re-confirmation. A full paired corrected 5×5 confirmation. And a single-fold screen
combined with an already-confirmed architecture. Each carried stronger CV backing than the last.
None transferred cleanly. Independent re-evaluations of published ADMET models on held-out data
report the same pattern at field scale,<sup>15</sup> and it is the reason blind challenges exist at
all.<sup>16</sup>

## The record gap

One process failure is worth recording because it caught me twice in three days, in the same shape.

Both of the last four submissions were sent by hand, outside any notebook session. The canonical
record of every submission is a document in the repository, and it lagged reality both times. Two
separate notebooks then read that document, found no entry for a submission that had really
happened, and concluded their own briefs were wrong about what the current best was. Both notebooks
had a standing rule to verify every quoted figure against its source before use, and that rule is
the reason this project has caught several genuinely wrong numbers. Here it fired correctly and
drew the wrong conclusion, because the source of truth was stale rather than the claim.

Neither correction is retracted in either notebook. They stand as a record of what was believed
when those notebooks ran, with a post-hoc note appended. The fix is not a better verification rule,
it is closing the gap between a submission happening and the record reflecting it.

## Where this leaves things

Macro ST-RAE has gone from 0.7179 to 0.5982 across eleven submissions. Almost all of that came from
correcting where predictions sit rather than from changing how they are produced. Two of the most
carefully evidenced modelling changes in the project both lost on the board, one of them
spectacularly, and the one that recovered did so through correction rather than through the model.

What has genuinely changed is what a board score means to me. A raw score confounds model quality
with placement, and Spearman is the only published metric that separates them. Read that way, the
AID architecture is better-ranked on CYP2D6 and worse on CYP3A4, and the dead-zone model is
better-ranked on CYP1A2 and worse on CYP2D6. None of that was visible in the ST-RAE column that
made both look like failures.

The intermediate reveal is on the 24th, and it scores the full blind set rather than the half every
figure above is measured on. Every ranking in this post is provisional against that.

---

## References

1. OpenADMET CYP Blind Challenge, Hugging Face Space, <https://huggingface.co/spaces/openadmet/cyp-challenge>, (accessed 18 August 2026).
2. K. Goossens, G. Tricarico, J. Hofmans, M.-P. Dréanic, S. De Cesco and E. B. Lenselink, ChemProp Multi-Task Models for Predicting ADME Properties in the Polaris Challenge, *ChemRxiv*, 2025, preprint, DOI: 10.26434/chemrxiv-2025-q12vh.
3. N. J. Wichrowski, M. V. Clemens-Sewall, K. K. Rao, C. Richardson, N. Q. Le, P. T. Koshute, J. Y. Liu, Y. Chushak, J. P. Coyle, T. R. Sterner and R. A. Clewell, Multitask Pretraining Framework for Improving Predictivity of Machine Learning Chemical Bioactivity Models for Low-Data Endpoints, *Chem. Res. Toxicol.*, 2026, **39**, 722–733.
4. H. Veith, N. Southall, R. Huang, T. James, D. Fayne, N. Artemenko, M. Shen, J. Inglese, C. P. Austin, D. G. Lloyd and D. S. Auld, Comprehensive Characterization of Cytochrome P450 Isozyme Selectivity across Chemical Libraries, *Nat. Biotechnol.*, 2009, **27**, 1050–1055.
5. PubChem BioAssay AID 1851, qHTS Assay for Cytochrome Panel, National Center for Advancing Translational Sciences, <https://pubchem.ncbi.nlm.nih.gov/bioassay/1851>, (accessed 17 September 2026).
6. G. A. Landrum and S. Riniker, Combining IC50 or K<sub>i</sub> Values from Different Sources Is a Source of Significant Noise, *J. Chem. Inf. Model.*, 2024, **64**, 1560–1567.
7. K. Yang, K. Swanson, W. Jin, C. Coley, P. Eiden, H. Gao, A. Guzman-Perez, T. Hopper, B. Kelley, M. Mathea, A. Palmer, V. Settels, T. Jaakkola, K. Jensen and R. Barzilay, Analyzing Learned Molecular Representations for Property Prediction, *J. Chem. Inf. Model.*, 2019, **59**, 3370–3388.
8. J. W. Burns, A. S. Zalte, C. R. A. Abreu, J. Sieg, C. Feldmann, M. Mathea and W. H. Green, Deep Learning Foundation Models from Classical Molecular Descriptors, *arXiv*, 2026, preprint, arXiv:2506.15792, DOI: 10.48550/arXiv.2506.15792.
9. Y. Benjamini and Y. Hochberg, Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing, *J. R. Stat. Soc. Series B Stat. Methodol.*, 1995, **57**, 289–300.
10. J. R. Ash, C. Wognum, R. Rodríguez-Pérez, M. Aldeghi, A. C. Cheng, D.-A. Clevert, O. Engkvist, C. Fang, D. J. Price, J. M. Hughes-Oliver and W. P. Walters, Practically Significant Method Comparison Protocols for Machine Learning in Small Molecule Drug Discovery, *J. Chem. Inf. Model.*, 2025, **65**, 9398–9411.
11. J. Simm, L. Humbeck, A. Zalewski, N. Sturm, W. Heyndrickx, Y. Moreau, B. Beck and A. Schuffenhauer, Splitting Chemical Structure Data Sets for Federated Privacy-Preserving Machine Learning, *J. Cheminform.*, 2021, **13**, 96.
12. 450 nm, *CYP Campaign: OpenADMET Blind Challenge*, operating dashboard, <https://openadmet-cyp-dashboard.vercel.app/operating_dashboard>, (accessed 20 September 2026).
13. SuperCowPowers, The CYP Challenge — Working Notes, *ADMET Workbench*, <https://supercowpowers.github.io/workbench/blogs/cyp_challenge/>, (accessed 3 September 2026).
14. R. Caruana, A. Niculescu-Mizil, G. Crew and A. Ksikes, Ensemble Selection from Libraries of Models, in *Twenty-First International Conference on Machine Learning (ICML '04)*, ACM Press, Banff, Alberta, Canada, 2004, p. 18.
15. I. Koleiev, R. Stratiichuk, N. Shevchuk, M. Melnychenko, D. Todoryshyn, V. Husak, S. Starosyla, S. Yesylevskyy and A. Nafiiev, Critical Assessment of ML Models for ADMET Prediction in TDC Leaderboards.
16. H. MacDermott-Opeskin, J. Scheen, C. Wognum *et al.*, A Computational Community Blind Challenge on Pan-Coronavirus Drug Discovery Data, *J. Chem. Inf. Model.*, 2026, **66**, 3129–3149.