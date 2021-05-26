const siteConfig = require('./site-config');
const { createFilePath } = require('gatsby-source-filesystem');
const appInsights = require('applicationinsights');
const makePluginData = require('./src/helpers/plugin-data');
const createRewriteMap = require('./src/helpers/createRewriteMap');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');
const path = require('path');
const Map = require('core-js/features/map');

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  // Log build time stats to appInsights
  appInsights
    .setup()
    .setAutoCollectConsole(true, true) // Enable logging of console.xxx
    .start();
} else {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing APPINSIGHTS_INSTRUMENTATIONKEY, this build will not be logged to Application Insights'
  );
}

let assetsManifest = {};

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === 'MarkdownRemark') {
    const slug = createFilePath({ node, getNode, basePath: '' });
    createNodeField({
      node,
      name: 'slug',
      value: slug,
    });
  }
};
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
    }
    type Frontmatter {
      archivedreason: String   
      authors: [Author]
      related: [String]
      redirects: [String]
      guid: String
    }
    type Author {
      title: String
      url: String
      img: String
    }
  `;
  createTypes(typeDefs);
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    devtool: 'eval-source-map',
    plugins: [
      new WebpackAssetsManifest({
        assets: assetsManifest, // mutates object with entries
        merge: true,
      }),
    ],
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      plugins: [
        new DirectoryNamedWebpackPlugin({
          exclude: /node_modules/,
        }),
      ],
    },
  });
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      categories: allMarkdownRemark(
        filter: { frontmatter: { type: { eq: "category" } } }
      ) {
        nodes {
          fields {
            slug
          }
          frontmatter {
            index
            redirects
          }
          parent {
            ... on File {
              name
              relativeDirectory
            }
          }
        }
      }
      rules: allMarkdownRemark(
        filter: {
          frontmatter: { type: { nin: ["category", "top-category", "main"] } }
        }
      ) {
        nodes {
          fields {
            slug
          }
          frontmatter {
            uri
            archivedreason
            related
            redirects
          }
        }
      }
    }
  `);


  result.data.rules.nodes.forEach((node) => {
    var match = false;
    result.data.categories.nodes.forEach((catNode) => {
      catNode.frontmatter.index.forEach((inCat) => {
        if (node.frontmatter.uri == inCat) {
          match = true;
        }
      });
    });
    if (match == false) {
      console.log('https://www.ssw.com.au/rules/' + node.frontmatter.uri);
    }
  });
  throw new Error();
};

exports.onPostBuild = async ({ store, pathPrefix }) => {
  const { pages } = store.getState();
  const pluginData = makePluginData(store, assetsManifest, pathPrefix);
  const rewrites = Array.from(pages.values())
    .filter((page) => page.context.redirects)
    .reduce((acc, page) => {
      acc = acc.concat(
        page.context.redirects.map((redirect) => {
          return {
            fromPath: pathPrefix + '/' + redirect,
            toPath: pathPrefix + page.path,
          };
        })
      );
      return acc;
    }, []);

  const allRewritesUnique = [
    ...new Map(rewrites.map((item) => [item.fromPath, item])).values(),
  ];
  await createRewriteMap.writeRewriteMapsFile(pluginData, allRewritesUnique);
};
