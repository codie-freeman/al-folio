// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-projects",
          title: "projects",
          description: "A collection of projects spanning analytical chemistry, pharmaceutical science, and scientific software.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "dropdown-bookshelf",
              title: "bookshelf",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/books/";
              },
            },{id: "dropdown-blog",
              title: "blog",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/blog/";
              },
            },{id: "post-how-i-approached-my-cv",
        
          title: "How I Approached My CV",
        
        description: "How I developed my CV as an undergraduate Chemistry student to successfully secure a placement year role and prepare for a difficult graduate market.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/How-I-approached-my-CV/";
          
        },
      },{id: "post-an-experimental-wake-up-call",
        
          title: "An Experimental Wake Up Call",
        
        description: "What Magnesium Stearate Taught Me About Theory vs Practice",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/An-Experimental-Wake-Up-Call/";
          
        },
      },{id: "post-media-i-consumed-this-week",
        
          title: "Media I Consumed This Week",
        
        description: "A loose collection of things that made me think about value, effort, and why we pay attention to certain ideas over others.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/Media-I-Consumed-This-Week/";
          
        },
      },{id: "books-a-single-man",
          title: 'A Single Man',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/A%20Single%20Man/";
            },},{id: "books-and-then-there-were-none",
          title: 'And Then There Were None',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/And%20then%20there%20were%20none/";
            },},{id: "books-animal-farm",
          title: 'Animal Farm',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/Animal%20Farm/";
            },},{id: "books-complications-a-surgeon-39-s-notes-on-an-imperfect-science",
          title: 'Complications - a surgeon&amp;#39;s notes on an imperfect science',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/Complications%20:%20a%20surgeon's%20notes%20on%20an%20imperfect%20science/";
            },},{id: "books-half-his-age",
          title: 'Half His Age',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/Half%20His%20Age/";
            },},{id: "books-im-glad-my-mom-died",
          title: 'Im Glad My Mom Died',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/Im%20Glad%20My%20Mom%20Died/";
            },},{id: "books-lord-of-the-flies",
          title: 'Lord of the Flies',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/Lord%20of%20the%20flies/";
            },},{id: "books-ready-player-one",
          title: 'Ready Player One',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/Ready%20Player%20One/";
            },},{id: "books-ready-player-two",
          title: 'Ready Player Two',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/Ready%20Player%20Two/";
            },},{id: "books-the-bullet-that-missed",
          title: 'The Bullet That Missed',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20Bullet%20That%20Missed/";
            },},{id: "books-the-heart-in-winter",
          title: 'The Heart in Winter',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20Heart%20in%20Winter/";
            },},{id: "books-the-last-devil-to-die",
          title: 'The Last Devil to Die',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20Last%20Devil%20to%20Die/";
            },},{id: "books-the-luckiest-guy-alive",
          title: 'The Luckiest Guy Alive',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20Luckiest%20Guy%20Alive/";
            },},{id: "books-the-man-who-died-twice",
          title: 'The Man Who Died Twice',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20Man%20Who%20Died%20Twice/";
            },},{id: "books-the-muslim-cowboy",
          title: 'The Muslim Cowboy',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20Muslim%20Cowboy/";
            },},{id: "books-the-prison-doctor",
          title: 'The Prison Doctor',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20Prison%20Doctor/";
            },},{id: "books-the-hundred-page-machine-learning-book",
          title: 'The Hundred-Page Machine Learning Book',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20hundred-page%20machine%20learning%20book/";
            },},{id: "books-the-thursday-murder-club",
          title: 'The Thursday Murder Club',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/TheThursdayMurderClub/";
            },},{id: "books-rules-are-less-important-than-kindness",
          title: 'Rules Are Less Important Than Kindness',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/There%20Are%20Places%20in%20the%20World%20Where%20Rules%20Are%20Less%20Important%20Than%20Kindness/";
            },},{id: "books-widow-basquiat",
          title: 'Widow Basquiat',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/Widow%20Basquiat/";
            },},{id: "books-either-or",
          title: 'Either/or',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/or/";
            },},{id: "books-what-if",
          title: 'What If?',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/what%20if/";
            },},{id: "projects-identification-amp-quantification-of-antiretroviral-drugs-using-hplc-ms",
          title: 'Identification &amp;amp; Quantification of Antiretroviral Drugs using HPLC‑MS',
          description: "Identification and quantification of antiretroviral drugs in an unknown sample using HPLC‑MS.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Identification%20and%20quantification%20of%20ARVs/";
            },},{id: "projects-inverse-gas-chromatography",
          title: 'Inverse Gas Chromatography',
          description: "A lightweight, reproducible toolkit for parsing, analysing, and visualising Inverse Gas Chromatography (IGC) surface energy data.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Inverse%20Gas%20Chromatograpghy/";
            },},{id: "projects-satraplatin-as-an-orally-active-pt-iv-prodrug",
          title: 'Satraplatin as an Orally Active Pt(IV) Prodrug',
          description: "Scientific poster examining Satraplatin&#39;s structure, mechanism, and clinical context as an orally active Pt(IV) prodrug.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Satraplatin%20as%20an%20Orally%20Active%20Pt(IV)%20Prodrug/";
            },},{id: "projects-sucrose-project",
          title: 'Sucrose Project',
          description: "Coming soon.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Sucrose/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%63%6F%6E%74%61%63%74@%63%6F%64%69%65%66%72%65%65%6D%61%6E.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/codie-freeman", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/codiefreeman", "_blank");
        },
      },{
        id: 'social-behance_username',
        title: 'Behance_username',
        section: 'Socials',
        handler: () => {
          window.open("", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
