---
layout: post
title: Entering OpenADMET's CYP450 blind challenge
date: 2026-08-22
description: Scoping the challenge, auditing and curating the released data, and mapping its chemical space. As part of a final year project entry into OpenADMET's CYP450 inhibition blind challenge.
tags: cheminformatics machine-learning admet python pharmaceutical-science
categories: dissertation
---

## Why this challenge, and why "blind" matters

I'm a final year Pharmaceutical Chemistry student, part of my final year project is built around entering OpenADMET's CYP450 inhibition blind challenge, entering only the Direct Inhibition regression track. The task is to predict pIC50 for four cytochrome P450 isoforms (CYP1A2, CYP2C9, CYP2D6, CYP3A4) on a blind test set of compounds.<sup>1</sup>

The fact it is a blind test set is one of the main benefit of challenges as well as the data curated and supplied by the OpenADMET team. A lot of ML for ADMET benchmarking still happens on previously published datasets, where the test set is existing data which is susceptible to data leakage leading to over confident results.<sup>2</sup> A genuinely blind challenge prevents this overconfidence. The test compounds are measured after the model is committed creating a stricter and more honest test.

The challenge opened 17 August 2026 and closes 3 November, with an intermediate leaderboard checkpoint in between. Before touching any model, the first job was working out exactly what was in the data.

## What's actually in the data (notebook 00)

Five data files got released.<sup>1</sup> The initial task was a structural audit only; shapes, dtypes, nulls, ranges, column overlap. No cleaning, no interpretation, no decisions about what to use yet.

| File | Rows x cols | What it is | In scope? |
|---|---|---|---|
| `TRAIN_inhibition.csv` | 4,905 x 18 | Primary Direct Inhibition training labels | **Yes** |
| `TEST-BLINDED.csv` | 750 x 2 | Blinded test set, identifiers only | **Yes** |
| `TRAIN_TDI.csv` | 6,145 x 36 | Time-Dependent Inhibition data | No |
| `single-concentration-TRAIN.csv` | 17,504 x 12 | Single-concentration primary screen | Not for now |
| `TRAIN_Emax.csv` | 6,146 x 30 | Emax vs. positive control | Not in current scope |


The main training file is a wide table with one row per compound, four isoforms each with a pIC50 point estimate plus `_conf_high`/`_conf_low`/`_std` companions. Each isoform column is around 52 to 74% null, compounds were only screened against a subset of the four isoforms. CYP3A4 is the most complete (1,412 in CYP1A2, 1,285 in CYP2C9, 1,493 in CYP2D6, 2,335 in CYP3A4).

`_conf_high`/`_conf_low` are the bounds fed straight into the official scoring metric, the Macro-Averaged Soft-Threshold Relative Absolute Error (MA-ST-RAE). For a single compound $i$ with bounds $[l_i, u_i]$ and prediction $\hat{y}_i$,

$$
e_i(\hat{y}_i) = \max(0,\; \hat{y}_i - u_i) + \max(0,\; l_i - \hat{y}_i)
$$

the soft-threshold absolute error is zero if the prediction falls inside the interval, otherwise the distance to the nearest bound (intervals are wider for low-activity compounds, so the metric naturally tends towards plain RAE at higher potency). The denominator applies this identical function to a naive constant baseline, $\bar{y} = \text{mean}(y_{\text{true}})$ over whichever set is being scored:

$$
\text{ST-RAE} = \frac{\sum_i e_i(\hat{y}_i)}{\sum_i e_i(\bar{y})}
$$

so a model that always predicts the mean scores exactly 1 by construction, and macro-averaging across the four isoform endpoints is a plain arithmetic mean:

$$
\text{MA-ST-RAE} = \frac{1}{4}\sum_{\text{isoform}} \text{ST-RAE}_{\text{isoform}}
$$

This was confirmed directly from `custom_scoring_functions.py` in the challenge's tutorial repository,<sup>3</sup> after OpenADMET staff confirmed on Discord that the tutorial's evaluation code had just been updated to match the backend exactly. One detail neither the docs nor the Discord thread state outright: the confidence level the `conf_low`/`conf_high` bounds represent isn't specified anywhere I've found, so I haven't assumed a figure for it here.

## Curating the data (notebook 01)

Salt or multi-component SMILES were checked before canonicalisation because the same parent compound in different salt forms will not share an InChIKey unless the salt is stripped first. This never came up in practice as zero rows in either file contained a "." in their SMILES.

Everything else followed the same don't assume pattern:

- Canonicalisation and InChIKey generation via one shared function in `src/features.py` (not duplicated inline, specifically to avoid cross-notebook fingerprint drift)
- Duplicate check within train, within test and leakage between them, all by InChIKey, zero on all three counts.
- Per-isoform non-null counts reconfirmed against the schema audit figures after canonicalisation, all four matched exactly.

I used InChIKey rather than canonical SMILES string for all of this as different ways of generating "canonical" SMILES for the same molecule are not guaranteed to be identical. InChIKey is a standardised structural identity check that sidesteps that assumption. This is also the same reasoning behind checking train/test leakage by structural identity rather than assuming a clean split holds automatically, since how a dataset is split or deduplicated materially affects what an evaluation ends up measuring.<sup>4</sup> InChIKey comparison was also utilised to identify stereoisomer pairs that a fingerprint alone can't distinguish.

## Mapping the chemical space (notebook 02)

Mapping the chemical space of the data provides a better insight into the data, taking inspiration from Antonio's PXR Challenge blog posts.<sup>5</sup> The same four questions apply here:

- How diverse is the space?
- Does potency track known structural determinants?
- How discontinuous is the SAR, are there activity cliffs?
- Is there enough scaffold structure for a cluster-based split to matter?

Each step answers something the previous one raised.

### How diverse is the space?

Pairwise Tanimoto similarity (ECFP4, chirality off) is low across the board, mean around 0.13 to 0.14 in every isoform subset. Most compound pairs share very little substructure. That is the first sign of a chemical space with few large, tightly related families.

![Overlaid pairwise Tanimoto similarity distribution across the four isoforms, alongside the within-train nearest-neighbour similarity distribution](/assets/img/posts/diversity_overlay_pairwise_tanimoto.png)
*Pairwise Tanimoto similarity (left) and within-train leave-one-out nearest-neighbour similarity (right), per isoform and overall.*

### Where does the test set sit relative to train?

For each of the 750 blinded test compounds, I computed the maximum Tanimoto similarity to any training compound and compared that distribution to the equivalent leave-one-out nearest-neighbour distribution within train itself. Test compounds turned out to be closer to their nearest training neighbour (median 0.587) than training compounds are to theirs (median 0.450), a large highly significant difference (Mann-Whitney p is approximately 1.3x10<sup>-225</sup> ). The blind test set sits comfortably inside the structural envelope of the training data, it does not look like it was constructed to be maximally novel relative to train.

![Test-to-train nearest-neighbour similarity versus within-train leave-one-out nearest-neighbour similarity, with medians marked](/assets/img/posts/test_train_nn_similarity_vs_train_loo.png)
*Test compounds (red, median 0.587) sit closer to their nearest training neighbour than training compounds sit to theirs (grey, median 0.450).*

### Does potency track known structural determinants?

Using isoform-specific descriptor sets adapted from Kiani and Jabeen,<sup>6</sup> correlations against pIC50 are mostly weak, as expected. CYP2D6's are essentially all near zero (logP: r = 0.002), which matches Beck et al.'s own finding of no significant MW/lipophilicity relationship for CYP2D6 specifically,<sup>7</sup> even though their test was a multiple regression and mine a simple correlation. The one moderate signal is CYP2C9 against a logD proxy (r = 0.47).

Looking closer at the per-isoform shapes rather than just the summary statistics: CYP3A4 is the clear outlier, a distinct low pIC50 mode below 3, on top of the weakest overall central tendency of the four (mean 4.10, versus 4.58 to 4.96 for the others). CYP1A2 shows a smaller version of the same pattern. Per the challenge's own tutorial documentation,<sup>3</sup> pIC50 values below 4 sit outside the assay's reliable testing range, so a real fraction of the CYP3A4 (and to a lesser extent CYP1A2) training data lives in that low-confidence region, exactly the kind of low activity mass that widens the `conf_low`/`conf_high` bounds feeding into MA-ST-RAE, and worth keeping in mind when the 0.4 threshold cliff numbers from the next section get interpreted.

![Per-isoform pIC50 distribution across the training set](/assets/img/posts/pic50_distribution_per_isoform.png)
*Per-isoform pIC50 distribution across the training set.*

### How discontinuous is the SAR, are there activity cliffs?

This is where I had originally planned to build a whole split-design decomposition. Using the Structure-Activity Landscape Index,<sup>8</sup> at the field-standard threshold from Van Tilborg et al. (Tanimoto >=0.9, ΔpIC50 >=1),<sup>9</sup> "similar pairs" turn out to be extremely rare: CYP1A2 and CYP2C9 have zero pairs meeting the bar at all, cliff prevalence is undefined there not necessarily zero, and CYP2D6/CYP3A4 rest on single-digit pair counts (3 and 4).

Four of those seven pairs turned out to be stereoisomer pairs that the chirality-off fingerprint cannot tell apart and are not genuine cliffs. At a looser, better-sampled threshold of 0.8, following the same style of sensitivity check used for the ASAP-Polaris-OpenADMET blind challenge,<sup>10</sup> cliff prevalence sits at 13 to 33% across the three isoforms where it's computable. At 0.4, where every isoform has enough pairs for a stable estimate, it rises to 29 to 45%. Both thresholds agree once the near-total absence at 0.9 is set aside, cliffs are a real and fairly common feature of this chemical space, not a rounding error.

![Chemical space landscape: Tanimoto similarity vs. absolute pIC50 difference, per isoform, with the cliff region outlined](/assets/img/posts/chemical_space_landscape_cliff_hexbin.png)
*Every within-isoform training pair, similarity vs. |ΔpIC50|, cliff region (sim≥0.9, |ΔpIC50|≥1) outlined in red. The near-total emptiness of that corner, across all four isoforms.*

### Is there enough scaffold structure for a cluster-based split to matter?

Of 4,526 distinct Bemis-Murcko scaffolds across the training set, 96.4% occur exactly once, together accounting for 89% of all compounds. Only 15 scaffolds have more than 10 members, and the two largest are generic building blocks (a bare phenyl ring, a phenyl-sulfonamide) rather than a real chemical series.

![Scaffold family size distribution, log-scaled y-axis, showing the overwhelming majority of scaffolds occurring exactly once](/assets/img/posts/scaffold_family_size_bar_chart.png)
*Scaffold family sizes across the training set. Only a handful of scaffolds have more than a few members.*

## What this actually raises

Three pieces of evidence demonstrate that the space is broadly diverse with low pairwise redundancy, scaffolds are almost entirely singleton and the real test set sits at least as close to train as train sits to itself. Together, that raises a genuine question about what a scaffold- or cluster-based split would achieve on this particular dataset, given how much a split design shapes what an evaluation actually measures.<sup>4</sup> For around 89% of compounds, an exact-scaffold split would put each compound in its own singleton cluster, which is functionally indistinguishable from a random split.

Once the field-standard threshold is loosened, cliffs turn out to be a real and fairly common feature of this chemical space (13 to 45% depending on threshold, not the near-total absence seen at 0.9), and that is exactly the kind of local structure a cluster split is meant to respect. Whether that resolves into a workable split design is actually worth investigating once real model errors exist, is not something this data alone answers. That is deliberately left open here rather than pre-decided. The next stage is building working models and letting what they actually get wrong guide which of these threads is worth following.

---

## References

1. *OpenADMET CYP Blind Challenge*, a Hugging Face Space by openadmet, https://huggingface.co/spaces/openadmet/cyp-challenge, (accessed 18 August 2026).

2. I. Koleiev, R. Stratiichuk, N. Shevchuk, M. Melnychenko, O. Nyporko, D. Todoryshyn, V. Husak, S. Starosyla, S. Yesylevskyy and A. Nafiiev, Critical Assessment of ML models for ADMET Prediction in TDC leaderboards, *bioRxiv*, 2026, preprint, DOI: 10.64898/2026.02.26.708193.

3. OpenADMET, *CYP-Challenge-Tutorial*, https://github.com/OpenADMET/CYP-Challenge-Tutorial, (accessed 23 August 2026).

4. J. Simm, L. Humbeck, A. Zalewski, N. Sturm, W. Heyndrickx, Y. Moreau, B. Beck and A. Schuffenhauer, Splitting chemical structure data sets for federated privacy-preserving machine learning, *J Cheminform*, 2021, **13**, 96.

5. A. De La Vega De Leon, PXR challenge #1: Exploring the data, https://www.delavega.ai/posts/2026_04_15_pxr_sar_exploration.html, (accessed 23 August 2026).

6. Y. S. Kiani and I. Jabeen, Exploring the Chemical Space of Cytochrome P450 Inhibitors Using Integrated Physicochemical Parameters, Drug Efficiency Metrics and Decision Tree Models, *Computation*, 2019, **7**, 26.

7. T. C. Beck, K. R. Beck, J. Morningstar, M. M. Benjamin and R. A. Norris, Descriptors of Cytochrome Inhibitors and Useful Machine Learning Based Methods for the Design of Safer Drugs, *Pharmaceuticals (Basel)*, 2021, **14**, 472.

8. R. Guha and J. H. Van Drie, Structure-Activity Landscape Index: Identifying and Quantifying Activity Cliffs, *J. Chem. Inf. Model.*, 2008, **48**, 646–658.

9. D. Van Tilborg, A. Alenicheva and F. Grisoni, Exposing the Limitations of Molecular Machine Learning with Activity Cliffs, *J. Chem. Inf. Model.*, 2022, **62**, 5938–5951.

10. L. H. Dinh Pham, M. T. Le and K. M. Thai, Improved ADME Prediction by Multitask Pretraining on Predicted Data: Insights from the ASAP-Polaris-OpenADMET Blind Challenge, *J. Chem. Inf. Model.*, 2026, **66**, 395–405.