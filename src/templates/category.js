import React, { useRef, useState } from 'react';
import { graphql, Link } from 'gatsby';
import PropTypes from 'prop-types';
import MD from 'gatsby-custom-md';
import GreyBox from '../components/greybox/greybox';
import Breadcrumb from '../components/breadcrumb/breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import Bookmark from '../components/bookmark/bookmark';
import {
  faArrowCircleRight,
  faPencilAlt,
} from '@fortawesome/free-solid-svg-icons';

export default function Category({ data }) {
  const linkRef = useRef();
  const category = data.markdownRemark;

  const [selectedOption, setSelectedOption] = useState('all');

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const components = {
    greyBox: GreyBox,
  };

  var rules = data.rule.nodes
    .filter((r) => {
      return !r.frontmatter.archivedreason;
    })
    .filter((r) => {
      return category.frontmatter.index.includes(r.frontmatter.uri);
    });
  return (
    <div>
      <Breadcrumb
        categoryTitle={category.frontmatter.title}
        isCategory={true}
      />
      <div className="w-full">
        <div className="rule-category rounded">
          <section className="mb-20 pb-2 rounded">
            <div className="cat-title-grid-container">
              <h2 className="cat-title">
                {category.frontmatter.title}
                <span className="rule-count">
                  {' - '} {rules.length} {rules.length > 1 ? 'Rules' : 'Rule'}
                </span>
              </h2>
              <button className="tooltip justify-self-end mt-1">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://github.com/SSWConsulting/SSW.Rules.Content/tree/${process.env.CONTENT_BRANCH}/${category.parent.relativePath}`}
                  className="tooltip tooltip-button"
                >
                  <FontAwesomeIcon
                    icon={faGithub}
                    size="2x"
                    className="category-icon bookmark-icon"
                  />
                </a>
                <span className="category-tooltip tooltiptext">
                  Edit in GitHub
                </span>
              </button>
            </div>

            <div className="rule-category-top pt-5 py-4 px-6">
              <MD components={components} htmlAst={category.htmlAst} />
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 radio-toolbar how-to-view text-center p-4 d-print-none">
              <div></div>
              <div>
                <input
                  type="radio"
                  id="customRadioInline1"
                  name="customRadioInline1"
                  className="custom-control-input"
                  value="titleOnly"
                  checked={selectedOption === 'titleOnly'}
                  onChange={handleOptionChange}
                />
                <label
                  className="view-title custom-control-label ml-1"
                  htmlFor="customRadioInline1"
                >
                  View titles only
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="customRadioInline3"
                  name="customRadioInline1"
                  className="custom-control-input"
                  value="blurb"
                  checked={selectedOption === 'blurb'}
                  onChange={handleOptionChange}
                />
                <label
                  className="view-blurb custom-control-label ml-1"
                  htmlFor="customRadioInline3"
                >
                  Show Blurb
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="customRadioInline2"
                  name="customRadioInline1"
                  className="custom-control-input"
                  value="all"
                  checked={selectedOption === 'all'}
                  onChange={handleOptionChange}
                />
                <label
                  className="view-full custom-control-label ml-1"
                  htmlFor="customRadioInline2"
                >
                  Gimme everything!
                </label>
              </div>
            </div>
            <div className="category-rule">
              <ol className="rule-number">
                {category.frontmatter.index.map((r) => {
                  var rule = rules.find((rr) => rr.frontmatter.uri == r);
                  if (!rule) {
                    return;
                  }
                  return (
                    <>
                      <li>
                        <section className="rule-content-title pl-2">
                          <div className="rule-header-container align-middle justify-between">
                            <h2 className="flex flex-col justify-center">
                              <Link
                                ref={linkRef}
                                to={`/${rule.frontmatter.uri}`}
                                state={{ category: category.parent.name }}
                              >
                                {rule.frontmatter.title}
                              </Link>
                            </h2>
                            <div className="rule-buttons flex flex-col sm:flex-row category">
                              <Bookmark
                                ruleId={rule.frontmatter.guid}
                                className="category-bookmark"
                              />
                              <button className="tooltip">
                                <a
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={`/rules/admin/#/collections/rule/entries/${rule.frontmatter.uri}/rule`}
                                  className="tooltip tooltip-button"
                                >
                                  <FontAwesomeIcon
                                    icon={faPencilAlt}
                                    size="lg"
                                    className="text-ssw-red bookmark-icon"
                                  />
                                </a>
                                <span className="tooltiptext">Edit</span>
                              </button>
                              <button className="tooltip">
                                <a
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={`https://github.com/SSWConsulting/SSW.Rules.Content/tree/${process.env.CONTENT_BRANCH}/rules/${rule.frontmatter.uri}/rule.md`}
                                  className="tooltip tooltip-button"
                                >
                                  <FontAwesomeIcon
                                    icon={faGithub}
                                    size="lg"
                                    className="text-ssw-red bookmark-icon"
                                  />
                                </a>
                                <span className="tooltiptext">
                                  Edit in GitHub
                                </span>
                              </button>
                            </div>
                          </div>
                        </section>

                        <section
                          className={`rule-content mb-4
                            ${selectedOption === 'all' ? 'visible' : 'hidden'}`}
                        >
                          <MD components={components} htmlAst={rule.htmlAst} />
                        </section>

                        <section
                          className={`rule-content mb-4
                          ${selectedOption === 'blurb' ? 'visible' : 'hidden'}`}
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: rule.excerpt }}
                          />
                          <p className="pt-5 pb-0 font-bold">
                            <Link
                              ref={linkRef}
                              to={`/${rule.frontmatter.uri}`}
                              state={{ category: category.parent.name }}
                              title={`Read more about ${rule.frontmatter.title}`}
                            >
                              <FontAwesomeIcon icon={faArrowCircleRight} /> Read
                              more
                            </Link>
                          </p>
                        </section>
                      </li>
                    </>
                  );
                })}
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

Category.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
};

export const query = graphql`
  query ($slug: String!, $index: [String]!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
      frontmatter {
        title
        index
        uri
        guid
      }
      parent {
        ... on File {
          relativePath
          name
        }
      }
    }
    rule: allMarkdownRemark(filter: { frontmatter: { uri: { in: $index } } }) {
      nodes {
        excerpt(format: HTML, pruneLength: 500)
        frontmatter {
          uri
          archivedreason
          title
          guid
        }
        htmlAst
      }
    }
  }
`;
