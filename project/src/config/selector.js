export const SELECTOR = {
  home: {
    url: "https://xhamster.com/best/weekly",
    list: ".thumb-list__item",
    title: { selector: "img", attr: "alt" },
    img: {
      selector: "img.thumb-image-container__image",
      attr: "src"
    },
    link: { selector: "a[data-role='thumb-link']", attr: "href" }
  },

  model: {
    url: "https://xhamster.com/pornstars",
    list: ".root-4fca8",
    title: { selector: ".primary-8643e", text: true },
    img: {
      selector: "img.thumb-image-container__image",
      attr: "src"
    },
    link: { selector: "a", attr: "href" },

    section: {
      list: ".thumb-list__item",
      title: { selector: "img", attr: "alt" },
      img: {
        selector: "img.thumb-image-container__image",
        attr: "src"
      },
      link: { selector: "a[data-role='thumb-link']", attr: "href" }
    }
  },

  channel: {
    url: "https://xhamster.com/channels",
    list: ".root-02a1b",
    title: { selector: ".primary-8643e", text: true },
    img: {
      selector: "img.thumb-image-container__image",
      attr: "src"
    },
    link: { selector: "a", attr: "href" },

    section: {
      list: ".thumb-list__item",
      title: { selector: "img", attr: "alt" },
      img: {
        selector: "img.thumb-image-container__image",
        attr: "src"
      },
      link: { selector: "a[data-role='thumb-link']", attr: "href" }
    }
  },

  tag: {
    url: "https://xhamster.com/categories",
    list: ".items .item a[data-role='tag-link']",
    title: { selector: "span", text: true },
    link: { attr: "href" },

    section: {
      list: ".thumb-list > .thumb-list__item",
      title: { selector: "img", attr: "alt" },
      img: {
        selector: "img.thumb-image-container__image",
        attr: "src"
      },
      link: { selector: "a[data-role='thumb-link']", attr: "href" }
    }
  }
};
