import React from 'react';
import { StaticQuery, graphql, Link } from 'gatsby';
import PropTypes from 'prop-types';
import { config } from '@fortawesome/fontawesome-svg-core';
// import { faArchive, faFlag } from '@fortawesome/free-solid-svg-icons';
import {
  faArchive,
  faPause,
  faStar,
  faHourglassEnd,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TopCategory from '../components/top-category/top-category';
import Breadcrumb from '../components/breadcrumb/breadcrumb';
import SideBar from '../components/side-bar/side-bar';
import { pathPrefix } from '../../site-config';

import { SelectOptions, FilterOptions } from '../components/filter/filter';

config.autoAddCss = false;

const Index = ({ data }) => {
  const notArchivedRules = data.rules.nodes.filter(
    (r) => !r.frontmatter.archivedreason
  );

  const displayTopCategories = (topcategory) => {
    return (
      <>
        <section className="mb-5 relative">
          <TopCategory
            topcategory={topcategory}
            categories={data.categories}
            rules={notArchivedRules}
          ></TopCategory>
        </section>
      </>
    );
  };

  return (
    <div className="w-full">
      <Breadcrumb isHomePage={true} />
      <div className="container" id="rules">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-3/4 px-4">
            <div className="rule-index no-gutters rounded">
              {data.main.nodes.map((element) => {
                return element.frontmatter.index.map((category) => {
                  const cat = data.topCategories.nodes.find(
                    (c) =>
                      c.parent.relativeDirectory.toLowerCase() ===
                      `categories/${category.toLowerCase()}`
                  );
                  if (cat) {
                    return displayTopCategories(cat);
                  }
                });
              })}
            </div>
            <section className="pb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 justify-items-center md:justify-items-start gap-4 md:gap-0 text-center md:text-left">
                <Link
                  to={'/all-rules'}
                  state={{
                    filter: FilterOptions.Nr,
                    select: SelectOptions.Custom,
                    input: 90,
                  }}
                >
                  <FontAwesomeIcon icon={faStar} /> New rules
                </Link>
                <Link
                  to={'/all-rules'}
                  state={{
                    filter: FilterOptions.Le,
                    select: SelectOptions.Custom,
                    input: 1460,
                  }}
                >
                  <FontAwesomeIcon icon={faHourglassEnd} /> Stale rules
                </Link>
                <a href={`${pathPrefix}/archived`}>
                  <FontAwesomeIcon icon={faArchive} /> Archived rules
                </a>
                <a href="https://www.ssw.com.au/ssw/Standards/Default.aspx">
                  <FontAwesomeIcon icon={faPause} /> Unmitigated rules
                </a>
              </div>

              {/* This like has been commented out as this page doesn't exisit.*/}
              {/* TODO: Create /out-of-dates page */}
              {/* <p>
                <a href="/out-of-dates">
                  <FontAwesomeIcon icon={faFlag} /> Show rules flagged as out of
                  date
                </a>
              </p> */}
            </section>
          </div>

          <div className="w-full lg:w-1/4 px-4" id="sidebar">
            <SideBar ruleTotalNumber={data.rules.nodes.length} />
          </div>
        </div>
      </div>
    </div>
  );
};
Index.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

const IndexWithQuery = (props) => (
  <StaticQuery
    query={graphql`
      query HomepageQuery {
        main: allMarkdownRemark(
          filter: {
            fileAbsolutePath: { regex: "/(categories)/" }
            frontmatter: { type: { eq: "main" } }
          }
        ) {
          nodes {
            html
            frontmatter {
              type
              title
              index
            }
            parent {
              ... on File {
                name
              }
            }
          }
        }
        topCategories: allMarkdownRemark(
          filter: {
            fileAbsolutePath: { regex: "/(categories)/" }
            frontmatter: { type: { eq: "top-category" } }
          }
        ) {
          nodes {
            html
            frontmatter {
              type
              title
              index
            }
            parent {
              ... on File {
                name
                relativeDirectory
              }
            }
          }
        }
        categories: allMarkdownRemark(
          filter: {
            fileAbsolutePath: { regex: "/(categories)/" }
            frontmatter: { type: { eq: "category" } }
          }
        ) {
          nodes {
            html
            frontmatter {
              type
              title
              index
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
          filter: { frontmatter: { type: { eq: "rule" } } }
        ) {
          nodes {
            frontmatter {
              title
              uri
              archivedreason
            }
          }
        }
      }
    `}
    render={(data) => <Index data={data} {...props} />}
  />
);

export default IndexWithQuery;
