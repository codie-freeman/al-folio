---
layout: post
title: My Self-Initiated Python and AI for Chemistry Learning
date: 2026-04-05 13:45:00
description: What I have been working on for my personal upskilling in Python and AI tailored for chemistry, and why I found each resource helpful.
tags:
categories:
---

Learning to code as a chemist raises an immediate question: where do you actually start? Generic Python courses exist in abundance, but most of them are built around toy problems with no scientific relevance. Getting comfortable with the language is useful, but the goal here was always something more specific -- understanding how computational tools apply to chemistry and drug discovery. This is a rundown of what I have been using, roughly in the order I approached it, and why each one was worth the time.

---

## Charles Weiss - Scientific Computing for Chemists with Python

The natural starting point for anyone coming from a chemistry background with little or no programming experience. The course is free, structured as interactive notebooks, and written in a way that keeps the focus on scientific application throughout. Each chapter covers a topic you will actually encounter, data handling, plotting, working with spectral data rather than abstract programming exercises disconnected from any real context. There are exercises at the end of each chapter and pointers to external reading where relevant.

The notebook format is part of why it works well early on. You are reading, running, and modifying code in the same place, which keeps the feedback loop tight and lowers the barrier to just trying things.

[Scientific Computing for Chemists](https://weisscharlesj.github.io/SciCompforChemists/intro.html)

---

## Reaching Out to My Lecturer

The University of Reading introduced a new module, Python, AI and Machine Learning for the Chemical Sciences, for the 2025/26 academic year, alongside a computationally focused final year project with Dr Mauricio Cafiero. I am currently on placement and will not return to university until September, but I arranged a video call with Dr Cafiero to get a clearer sense of direction. He helped me understand which resources were worth prioritising, recommended some background reading, and gave me access to the module content on Blackboard so I could get a head start. It was a useful conversation and I would encourage anyone in a similar position to make that kind of contact early rather than waiting until they are back in the building.

---

## The Hundred-Page Machine Learning Book - Andriy Burkov

Recommended by Dr Cafiero following our call. It is available as a free PDF under a read-first, buy-later principle. Rather than a tutorial resource, this is background reading. It covers the theory and mathematics behind common machine learning algorithms in a concise and accessible way. It is useful for understanding what is actually happening inside the methods you end up using, rather than treating them as black boxes. Worth reading alongside more practical work rather than in isolation.

[The Hundred-Page Machine Learning Book](http://themlbook.com)

---

## Linear Algebra and Calculus

I did not do A-level maths, and some of the notation that appears in machine learning literature, summations, partial derivatives, matrix operations were  difficult to follow without some grounding in it. Spending time on this before going deeper into the theory made a real difference.

### LinkedIn Learning: Machine Learning Foundations (Terezija Semenski)

A solid introductory course that covers the mathematical foundations without assuming much prior knowledge. Useful for building enough familiarity with the underlying concepts to follow along when they appear in more technical material.

---

## YouTube

Some aspects of machine learning are difficult to grasp from text alone, particularly anything involving how neural networks actually learn or how linear algebra operations translate into something geometrically meaningful. Video filled that gap for me.

**3Blue1Brown** is the clearest recommendation I can make here. Their series on neural networks and their separate series on linear algebra and calculus are genuinely excellent they build visual intuition for concepts that can feel abstract when you encounter them written down. If you are finding something difficult to picture, there is a reasonable chance Grant Sanderson has made a video about it.

[3Blue1Brown - Neural Networks](https://www.youtube.com/watch?v=aircAruvnKk&list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi)

**Data Professor** (Chanin Nantasenamat) produces content specifically oriented around data science in biology and chemistry, which makes it more directly relevant than most general machine learning channels. His videos on building QSAR models and working with biological datasets are particularly useful if you are coming at this from a pharmaceutical science angle.

[Data Professor](https://www.youtube.com/@DataProfessor)

**Daniel Bourke** covers machine learning and PyTorch in a clear, project-oriented way. His content is well structured and he is good at explaining the practical side of building and training models rather than just the theory. A useful complement to more formal resources.

[Daniel Bourke](https://www.youtube.com/@mrdbourke)

---

## Pat Walters - Practical Cheminformatics Tutorials

This is where the learning becomes domain-specific in a more serious way. Pat Walters is a computational chemist with decades of industry experience, and his tutorial repository is a collection of Jupyter notebooks covering cheminformatics as it is actually practised in drug discovery QSAR modelling, molecular clustering, structure-activity relationships, generative models, and docking.

It sits later in this list deliberately. Unlike the Weiss course, it is not written as a guided introduction the notebooks assume you are already comfortable with Python and are ready to work with RDKit, scikit-learn, and similar libraries. It also runs primarily in Google Colab rather than a local environment, which changes the workflow slightly. Coming to it after building some foundations means you can focus on the chemistry and the methodology rather than fighting the syntax.

I am working through it with a focus on the QSAR modelling and molecular representation sections, with a view to building a small standalone project around pharmaceutical activity prediction as a practical output.

[Practical Cheminformatics Tutorials](https://github.com/PatWalters/practical_cheminformatics_tutorials)