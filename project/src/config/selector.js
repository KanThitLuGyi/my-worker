export const SELECTOR = {
  home: {
    url: "https://www.pornhat.com",
    list: ".thumb-video",
    title: { selector: "a", attr: "title" },
    img: {
      selector: "img",
      attr: "data-original"
    },
    link: { selector: "a", attr: "href" }
  },

  model: {
    url: "https://www.pornhat.com/models/",
    list: ".thumb-ctr",
    title: { selector: "a", attr: "title" },
    img: {
      selector: "img",
      attr: "data-original"
    },
    link: { selector: "a", attr: "href" },

    section: {
      list: ".thumb-video",
      title: { selector: "a", attr: "title" },
      img: {
        selector: "img",
        attr: "data-original"
      },
      link: { selector: "a", attr: "href" }
    }
  },

  channel: {
    url: "https://www.pornhat.com/channels/",
    list: ".thumb-ctr",
    title: { selector: "a", attr: "title" },
    img: {
      selector: "img",
      attr: "src"
    },
    link: { selector: "a", attr: "href" },

    section: {
      list: ".thumb-video",
      title: { selector: "a", attr: "title" },
      img: {
        selector: "img",
        attr: "data-original"
      },
      link: { selector: "a", attr: "href" }
    }
  },

  tag: {
    url: "https://www.pornhat.com/tags/",
    list: ".tags-holder a.item",
    title: { selector: "span", text: true },
    link: { attr: "href" },

    section: {
      list: ".thumb-video",
      title: { selector: "a", attr: "title" },
      img: {
        selector: "img",
        attr: "data-original"
      },
      link: { selector: "a", attr: "href" }
    }
  }
};
