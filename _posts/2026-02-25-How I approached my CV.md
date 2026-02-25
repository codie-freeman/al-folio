---
layout: post
title: How I Approached My CV
date: 2026-02-24 21:30:00
description: How I developed my CV as an undergraduate Chemistry student to successfully secure a placement year role and prepare for a difficult graduate market.
tags:
categories:
---

### Noisy Information

There seems to be an endless supply of people wanting to give out tips and tricks for CVs, but the majority of it isn't helpful. The information out there is noisy, over-saturated, and usually comes from people who have made posting on LinkedIn their biggest personality trait.

A lot of so-called advice is little more than an attempt to sell something to people who are desperate in a difficult job market. Templates, courses, "insider secrets" claiming to have everything you need to land that dream role. For the large majority of people, that just isn't the case. The fundamentals of a strong CV aren't a secret, and you don't need to pay for them.

---

### Where to Actually Start

Before you look anywhere else, use what you're already paying for. Every university will have a careers team, and most students underutilise them entirely. It isn't just Unidays and a discounted railcard. Universities offer CV reviews, mock interviews, and application support for current students, recent graduates, and often alumni too. If you haven't booked an appointment with yours yet, that's the first thing to do.

Professional bodies are another underused resource, particularly for STEM students. The Royal Society of Chemistry offers free CV reviews and careers advice through their careers service, delivered by people who actually work in or alongside the industry. That kind of sector-specific feedback is hard to come by and genuinely valuable, especially when you're applying for placement or graduate roles in pharma, research, or manufacturing.

---

### Resources I'd Recommend

Beyond your university, two resources worth your time specifically:

**Raj Sidhu (YouTube)** — practical, no-nonsense careers advice aimed at people entering competitive graduate markets. Content on a range of careers advice and has a unique insight I don't see in similar content, short concise videos that have definitely been insightful and helpful to me personally. 
[youtube.com/@rajsidhu](https://www.youtube.com/@rajsidhu)

**Cambridge Careers: CVs and Applications Guide** — This is one of the most well-structured CV guides available online and covers structure, content and tailoring in a way that applies regardless of where you're studying.
[careers.cam.ac.uk (PDF)](https://www.careers.cam.ac.uk/files/cambridgecvsandapplications.pdf)

---

### Templates and Formatting

You've likely heard about ATS (Applicant Tracking Systems) and the growing use of AI screening in recruitment. Both are genuine considerations, particularly as platforms like Indeed and LinkedIn have made it easier than ever to mass-apply to roles, pushing application volumes up significantly and creating a lot of noise recruiters have to work through.

Keeping your CV simple and clean is the consistent advice from reliable sources, and I'd agree with that entirely. My only additional recommendation is to build yours in LaTeX.

This might sound intimidating if you've never used it, but online editors like Overleaf make it accessible. With a starting template and some AI assistance for the initial setup, you can have a professional framework in place over a weekend. After that it becomes a straightforward canvas, easy to expand and tailor for each application without the formatting headaches that come with Word. LaTeX also tends to parse cleanly through ATS systems, which is a practical bonus on top of the visual consistency it gives you.

**LaTeX CV Templates:**
[overleaf.com/latex/templates/tagged/cv](https://www.overleaf.com/latex/templates/tagged/cv)

**Non-LaTeX alternative:** if you'd prefer to stay in Word or Google Docs for now, this template series is one of the better free options available.
[YouTube: CV Template Series](https://www.youtube.com/watch?v=mSYPgwkGlKg&list=PL_GpK4-mRYmShJmAsk_QaMX5ymXA7JTVh&index=4)

---

### How I Structured My Own CV

The structural decisions behind my CV weren't arbitrary. Recruiters typically spend around 6 to 7 seconds on an initial scan before deciding whether to read further, and that scan follows a predictable pattern, starting on the left and picking up on visual anchors as it moves across. With that in mind, I put a bold keyword at the start of each bullet point, making the left-hand side of the page scannable at a glance. A recruiter can run their eye down the page and immediately pick out method development, technical report writing, or process improvement without having to parse full sentences to find them.

Each bullet follows a consistent format: what you did, how you did it, and the outcome, quantified wherever possible. Specific evidence is always stronger than a general claim.

I also kept the structure modular deliberately. The core content stays the same, but the emphasis, ordering and summary can be adjusted fairly quickly depending on the role. Applying for an analytical position versus a manufacturing role versus something more business-facing all warrant different framing, and a clean LaTeX structure makes that kind of tailoring straightforward without rewriting everything from scratch each time.

The goal isn't a CV that works for everyone. It's one that works well for the roles you actually want.

[Codie Freeman CV (PDF)](</assets/pdf/Codie Freeman CV.pdf>)

---

### Where I Can Still Improve

The professional summary is a known weakness. A short paragraph at the top of a CV works for some reviewers and frustrates others, and there's a reasonable
argument that it wastes prime real estate on something a recruiter is likely to skip. Worth reconsidering for future versions.

The bullet points, whilst technically accurate, are word-heavy. There isn't much negative space on the page and that can feel dense to read, which is partly why I stuck to a two-line limit per bullet. It's a balance that doesn't fully resolve the problem, but it keeps things from getting worse.

The overall tone reads as fairly clinical. That's partly a deliberate choice given the technical nature of the roles I'm targeting, but it's a fair criticism
that it lacks much personality. 

CVs are subjective and you genuinely cannot please everyone, so take all of this with a pinch of salt.

---

### My CV LaTeX Formatting 

Based on the [RenderCV Engineering Resume Template](https://www.overleaf.com/latex/templates/rendercv-engineeringresumes-theme/shwqvsxdgkjy)

```
\documentclass[10pt, a4paper]{article}

% === PREAMBLE ===
\usepackage[
    ignoreheadfoot,
    top=1.0cm,
    bottom=1.0cm,
    left=1.3cm,
    right=1.3cm,
    footskip=0.8cm,
]{geometry}
\usepackage{titlesec}
\usepackage{tabularx}
\usepackage{array}
\usepackage[dvipsnames]{xcolor}
\definecolor{primaryColor}{RGB}{0, 0, 0}
\usepackage{enumitem}
\usepackage{fontawesome5}
\usepackage{amsmath}
\usepackage[
    pdftitle={Codie Freeman's CV},
    pdfauthor={Codie Freeman},
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref}
\usepackage[pscoord]{eso-pic}
\usepackage{calc}
\usepackage{bookmark}
\usepackage{lastpage}
\usepackage{changepage}
\usepackage{paracol}
\usepackage{ifthen}
\usepackage{needspace}
\usepackage{iftex}

\ifPDFTeX
    \input{glyphtounicode}
    \pdfgentounicode=1
    \usepackage[T1]{fontenc}
    \usepackage[utf8]{inputenc}
    \usepackage{lmodern}
\fi

\usepackage{merriweather}

%\raggedright
% === RHS Text alignment ===
\usepackage{ragged2e}
\justifying
\usepackage{microtype}
\emergencystretch=3em  % Increase this
\tolerance=2000        % Allow more flexibility
\usepackage[none]{hyphenat}

\AtBeginEnvironment{adjustwidth}{\partopsep0pt}
\pagestyle{empty}
\setcounter{secnumdepth}{0}
\setlength{\parindent}{0pt}
\setlength{\topskip}{0pt}
\setlength{\columnsep}{0.15cm}
\pagenumbering{gobble}

\titleformat{\section}{\needspace{4\baselineskip}\bfseries\large}{}{0pt}{}[\vspace{1pt}\titlerule]
\titlespacing{\section}{-1pt}{0.3 cm}{0.15 cm}

\renewcommand\labelitemi{$\vcenter{\hbox{\small$\bullet$}}$}
\newenvironment{highlights}{\begin{itemize}[topsep=0.10 cm,parsep=0.10 cm,partopsep=0pt,itemsep=0pt,leftmargin=10pt]}{\end{itemize}}
\newenvironment{onecolentry}{\begin{adjustwidth}{0 cm}{0 cm}}{\end{adjustwidth}}
\newenvironment{twocolentry}[2]{\onecolentry\textbf{#1} \hfill \textit{#2}}{\endonecolentry}

\newenvironment{header}{\setlength{\topsep}{0pt}\par\kern\topsep\centering\linespread{1.5}}{\par\kern\topsep}

% === DOCUMENT START ===
\begin{document}

\begin{header}
    \fontsize{25 pt}{25 pt}\selectfont Codie Freeman

    \vspace{5 pt}
    
    \normalsize
    \href{mailto:contact@codiefreeman.com}{contact@codiefreeman.com} \,|\,
    07557 278 469 \,|\, \href{https://linkedin.com/in/codiefreeman}{linkedin.com/in/codiefreeman} \,|\,
    \href{https://codiefreeman.com}{codiefreeman.com} %\,|\, \href{https://github.com/codie-freeman}{github.com/codie-freeman}
    
\end{header}

\vspace{0.10 cm}

% === PROFILE ===
\section{Professional Summary}

\begin{onecolentry}
 GMP‑trained Analytical Chemist and Pharmaceutical Chemistry student with experience across solid-state and advanced analytical techniques. Skilled in generating high quality datasets, maintaining ALCOA++ data integrity and supporting regulated workflows, complemented by prior management experience in a compliance‑driven environment.
\end{onecolentry}

% === TECHNICAL SKILLS ===
\section{Technical Skills}

\begin{onecolentry}
\textbf{Solid‑State Methods:} iGC‑SEA, DVS, PXRD, DSC, TGA, SEM, Light Microscopy.
\end{onecolentry}

\vspace{0.1 cm}
\begin{onecolentry}
\textbf{Analytical \& Separation:} HPLC‑MS, GC, NMR (\textsuperscript{1}H \& \textsuperscript{13}C), FTIR, TLC.
\end{onecolentry}

\vspace{0.1 cm}
\begin{onecolentry}
\textbf{Quality \& Compliance:} GMP, ALCOA++, CAPA Processes, SOPs, COSHH, Risk Assessment, Data Integrity.
\end{onecolentry}

\vspace{0.1 cm}
\begin{onecolentry}
\textbf{Computational \& Data Analysis:} Python (Pandas, NumPy, Matplotlib, Jupyter), Git/GitHub.
\end{onecolentry}

% === Professional EXPERIENCE ===
\section{Professional Experience}

\begin{twocolentry}{Student Scientist, Resolian -- Sandwich, Kent}{Aug 2025 -- Aug 2026}
\end{twocolentry}

\vspace{0.10 cm}
\begin{onecolentry}
\begin{highlights}
    \item \textbf{Method Development:} Designed an iGC-SEA flow‑rate case study demonstrating up to a 50\% reduction in run time for larger probes, evidencing capability for varied‑flow‑rate method development.
    \item \textbf{Technical Report Writing:} Authored multiple stability study reports as lead author for sponsors, with deliverables undergoing technical and QC review before submission, ensuring professional documentation.
    \item \textbf{Solid-State Characterisation:} Applied iGC, SEM, PXRD, DSC, DVS, TGA and light microscopy across sponsor projects to support material understanding and sample assessment.
    \item \textbf{Process Improvement:} Streamlined light microscopy workflows by replacing a four‑step manual composition process with a single composite‑image tool, improving consistency and presentation quality.
    \item \textbf{Technical Training \& Communication:} Created microscopy training resources and delivered a session to three analysts, with materials shared across the wider laboratory team to support consistent practice.
    \item \textbf{Cross-Project Collaboration:} Worked across analytical and solid‑state techniques depending on project scope, adapting to varied timelines and requirements in a CRO environment.
    \item \textbf{Data Integrity \& Documentation:} Maintained accurate laboratory notebooks, ADFs and audit trails across GMP projects, contributing to multiple sponsor reports and ensuring full traceability.
\end{highlights}
\end{onecolentry}

\vspace{0.30 cm}

\begin{twocolentry}{Shift Manager, JD Wetherspoon -- Reading, Berkshire}{Jan 2022 -- Jun 2025}
\end{twocolentry}

\vspace{0.10 cm}
\begin{onecolentry}
\begin{highlights}
    \item \textbf{Team Leadership:} Managed teams of up to 20 staff in a hospitality environment, managing onboarding, training, and shift operations within a 90+ person team.
    \item \textbf{Operational Performance \& Problem Solving:} Improved internal audit scores by 15\%, contributing to the site's first all‑green audit in 10 years across cleanliness, stock, cash and people.
    \item \textbf{Regulatory Coordination:} Held personal licence, ensuring full compliance with licensing laws and leading a regulatory inspection that achieved a 5/5 rating.
%    \item \textbf{Training, Coaching \& Development:} Delivered structured training to new starters and junior managers, improving consistency and performance across shifts.
\end{highlights}
\end{onecolentry}

% === EDUCATION ===
\section{Education}

\begin{twocolentry}{BSc (Hons) Pharmaceutical Chemistry, University of Reading}{Sep 2021 -- Jun 2027}
\normalfont\footnotesize\itshape \\ including foundation year, industrial placement and approved interruption of study

\end{twocolentry}

\vspace{0.10 cm}
\begin{onecolentry}
\begin{highlights}
    \item \textbf{Key modules:} Pharmaceutical Chemistry, Further Organic Chemistry, Further Physical Chemistry, Python, AI and Machine Learning for Chemical Sciences.
\end{highlights}
\end{onecolentry}


%\newpage



% === PROJECTS ===
\section{Projects}

\begin{twocolentry}{Surface Energy of Sucrose at Modified Particle Sizes}{Jan 2026 -- Present}
\end{twocolentry}
\vspace{0.10 cm}
\begin{onecolentry}
\begin{highlights}
    \item Investigated the effect of particle size modification on the surface energy of sucrose through iGC and SEM to assess particle morphology and link physical changes to measured surface energetics.
\end{highlights}
\end{onecolentry}

\vspace{0.20 cm}

\begin{twocolentry}{IGC-SEA Python Package}{Jan 2026 -- Present}
\end{twocolentry}
\vspace{0.10 cm}
\begin{onecolentry}
\begin{highlights}
    \item Developing a Python package for post processing SMS-IGC-SEA surface energy csv export data.
    \item Multi-table CSV parsing, reproducible surface energy and acid-base calculations. Providing more detailed analysis and customisation then proprietary software for developed modes.
\end{highlights}
\end{onecolentry}


% === PROFESSIONAL DEVELOPMENT ===
\section{Professional Development}

\begin{onecolentry}
\begin{highlights}
    \item Member of the Royal Society of Chemistry (RSC) including Chemical Information and Computer Applications Group and Joint Pharmaceutical Analysis Group (JPAG)
    \item Completed the University of Reading \textit{RED Award}, demonstrating commitment to structured professional development and employability skills.
    \item Completed CPD-accredited \textit{I'm a Scientist Academy} training programme in science communication and public engagement
\end{highlights}
\end{onecolentry}


% === Voulenteering ===
\section{Volunteering}

\begin{twocolentry}{STEM Ambassador, STEM Learning UK}{Jul 2025 -- Present}
\end{twocolentry}

\vspace{0.10 cm}
\begin{onecolentry}
\begin{highlights}
    \item Deliver outreach through the \textit{I’m a Scientist} programme, supporting and encouraging student engagement in chemistry and pharmaceutical sciences.
\end{highlights}
\end{onecolentry}

\end{document}
```