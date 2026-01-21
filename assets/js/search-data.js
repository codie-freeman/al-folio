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
          description: "A growing collection of your cool projects.",
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
            },{id: "post-media-i-consumed-this-week",
        
          title: "Media I Consumed This Week",
        
        description: "A loose collection of things that made me think about value, effort, and why we pay attention to certain ideas over others.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/Test/";
          
        },
      },{id: "books-and-then-there-were-none",
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
            },},{id: "books-the-bullet-that-missed",
          title: 'The Bullet That Missed',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20Bullet%20That%20Missed/";
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
            },},{id: "books-the-prison-doctor",
          title: 'The Prison Doctor',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/The%20Prison%20Doctor/";
            },},{id: "books-the-thursday-murder-club",
          title: 'The Thursday Murder Club',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/TheThursdayMurderClub/";
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
          description: "Second‑year pharmaceutical chemistry project (83%)",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Identification%20and%20quantification%20of%20ARVs/";
            },},{id: "projects-satraplatin-as-an-orally-active-pt-iv-prodrug",
          title: 'Satraplatin as an Orally Active Pt(IV) Prodrug',
          description: "Pharmaceutical Chemistry group poster project (70%)",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Satraplatin%20as%20an%20Orally%20Active%20Pt(IV)%20Prodrug/";
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
