---
layout: page
title: Identification and Quantification of Antiretroviral Drugs using HPLC-MS
description: A second-year analytical lab in which I built calibration curves for five antiretrovirals, analysed an unknown, and used residual and LOD/LOQ analysis to work out what had gone wrong with it.
img: /assets/img/arv-hplc-ms-cover.png
importance: 3
---

[Full report (PDF)]({{ "/assets/pdf/ARV-HPLC-MS-REPORT.pdf" | relative_url }})

This was a university laboratory exercise from March 2025, written up as a journal-style report. The task was to identify and quantify antiretroviral drugs in a simulated bodily fluid by HPLC-MS. The method worked; the unknown sample did not, and most of what I got out of the exercise came from working out why.

## The method

Stock solutions of five antiretrovirals (efavirenz, emtricitabine, lopinavir, ritonavir and tenofovir disoproxil fumarate) were serially diluted to give calibration standards from 1 to 100 µg mL⁻¹. Each was run on an Agilent 1100 HPLC coupled to a Thermo LTQ Orbitrap XL in positive electrospray mode, on a C18 column with a formic acid water/acetonitrile gradient. A blank was run before each set of standards and its peak area subtracted, and the adjusted peak areas were regressed against concentration.

Linearity was good. R² ranged from 0.954 for emtricitabine to 0.996 for ritonavir, with most analytes above 0.99.

## What the residuals showed

Residual plots for lopinavir and ritonavir had the same shape: negative at 1, 10 and 100 µg mL⁻¹ and positive at 25 and 50 µg mL⁻¹. A curved residual pattern shared across two unrelated compounds points to something procedural rather than chemical, most likely pipetting error during the serial dilutions or slight detector non-linearity. Percentage errors across the 10 to 100 µg mL⁻¹ range sat within ±15%, which is acceptable for nominal concentrations, but at 1 µg mL⁻¹ the error exceeded 100% against an accepted limit of ±20% at the lower limit of quantification. The curves were usable, with the proviso that anything near the bottom of the range needed caution.

## The unknown sample

Screening the unknown (MK-U) against retention times found signals for four of the five drugs: lopinavir at about 18.7 min, ritonavir at 18.1, emtricitabine at 3.3 and TDF at 13.4. Efavirenz was absent.

Seeing a peak is not the same as being able to quantify it, so I calculated limits of detection and quantification for each analyte from the blank noise and the calibration slope. Emtricitabine and TDF were present at trace level with adjusted peak areas far below those of the other two, and could have been contamination, carry-over or background, so I reported them as detected but not quantified. Lopinavir and ritonavir were well above their LOQs and were quantified at 143.7 and 310.6 µg mL⁻¹ respectively.

Both values are outside the validated 1 to 100 µg mL⁻¹ range, and the sample had been prepared from diluted standards that should have fallen inside it. That rules out the method and points to the preparation: an incorrect dilution, over-spiking, or failure to adjust the total volume after adding more than one standard. With no replicate injections there was no way to assess precision, which is the first thing I would change.

## What I would do differently

Dilute directly from the stock rather than through a chain of intermediates, so errors do not compound. Run replicate injections. Use an internal standard. None of these is unusual, but the exercise made clear which failure each one guards against.