export const SELECTOR = {
  home: {
    url: "https://xhamster.com/best/weekly",
    list: ".thumb-list__item",
    title: { selector: "img", attr: "alt" },
    img: { selector: "img" },
    link: { selector: "a", attr: "href" }
  },

  model: {
    url: "https://xhamster.com/pornstars",
    list: ".root-4fca8",
    title: { selector: "img", attr: "alt" },
    img: { selector: "img" },
    link: { selector: "a", attr: "href" },

    section: {
      list: ".thumb-list__item",
      title: { selector: "img", attr: "alt" },
      img: { selector: "img" },
      link: { selector: "a", attr: "href" }
    }
  },

  channel: {
    url: "https://xhamster.com/channels",
    list: ".root-02a1b",
    title: { selector: "img", attr: "alt" },
    img: { selector: "img" },
    link: { selector: "a", attr: "href" },

    section: {
      list: ".thumb-list__item",
      title: { selector: "img", attr: "alt" },
      img: { selector: "img" },
      link: { selector: "a", attr: "href" }
    }
  },

  tag: {
    url: "https://xhamster.com/categories",
    list: ".items .item a[data-role='tag-link']",
    title: { selector: "span", text: true },
    link: { attr: "href" },

    section: {
      list: ".thumb-list__item",
      title: { selector: "img", attr: "alt" },
      img: { selector: "img" },
      link: { selector: "a", attr: "href" }
    }
  }
};
