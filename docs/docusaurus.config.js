// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/oceanicNext");
const darkCodeTheme = require("prism-react-renderer/themes/vsDark");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Documentation",
  tagline: "bigsby documentation",
  url: "https://burketyler.github.io",
  baseUrl: "/bigsby/",
  trailingSlash: false,
  projectName: "burketyler.github.io",
  organizationName: "burketyler",
  favicon: "img/favicon-32x32.png",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebar.js"),
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Bigsby",
        hideOnScroll: true,
        logo: {
          alt: "bigsby logo",
          src: "img/bigsby-logo-light.svg",
          srcDark: "img/bigsby-logo-dark.svg"
        },
        items: [
          {
            type: "doc",
            docId: "setup",
            position: "left",
            label: "Docs",
          },
          {
            href: "https://github.com/burketyler/bigsby",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Setup",
                to: "/docs/setup",
              },
              {
                label: "Getting Started",
                to: "/docs/getting-started",
              },
              {
                label: "Usage",
                to: "/docs/usage",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "NPM",
                href: "https://www.npmjs.com/package/bigsby",
              },
              {
                label: "GitHub",
                href: "https://github.com/burketyler/bigsby",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Wirt's Leg Pty Ltd.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        defaultLanguage: "typescript"
      },
    }),
};

module.exports = config;
