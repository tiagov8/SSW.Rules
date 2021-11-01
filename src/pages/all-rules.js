import React, { useRef, useEffect, useState } from 'react';
import { StaticQuery, graphql } from 'gatsby';
import PropTypes from 'prop-types';
import Breadcrumb from '../components/breadcrumb/breadcrumb';
import SideBar from '../components/side-bar/side-bar';
import TopCategoryHeader from '../components/topcategory-header/topcategory-header';
import DropdownCard from '../components/dropdown-card/dropdown-card';
import GreyBox from '../components/greybox/greybox';
import Filter, {
  SelectOptions,
  FilterOptions,
} from '../components/filter/filter';
import { format, formatDistance, formatDistanceToNow, subDays } from 'date-fns';

import useMount from '../hooks/useMount';

import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'gatsby';

import locale from 'date-fns/locale/en-AU';

//Todo(Jack): Fix the inconsistencies around the rounded edges - Make sure they are all the same
//Todo(Jack): Split up components into separate files
//Todo(Jack): Add Prop Types for validation
//Todo(Jack): Improve the filter button - make Icon bigger & change color on click
//!Bug(Jack): Fix the button in Filter (see filter.js)

const Heading = ({ title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <h6
        className={`top-category-header px-4 py-2 flex ${
          isCollapsed ? 'rounded' : 'rounded-t'
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full text-left"
        >
          {title}{' '}
          <span className="number">
            <p
              style={{
                textTransform: 'none',
                display: 'inline-block',
              }}
            >
              Rules
            </p>
          </span>
          <span className="collapse-icon">
            <FontAwesomeIcon icon={isCollapsed ? faAngleDown : faAngleUp} />
          </span>
        </button>
      </h6>
      <ol className={`pt-3 px-4 py-2 ${isCollapsed ? 'hidden' : 'block'}`}>
        {children}
      </ol>
    </>
  );
};

const AllRulesContent = ({ filtereditems, title, notFound }) => {
  // console.log(filterOption.filter, filtereditems);

  const formatDistanceLocale = {
    lessThanXSeconds: '{{count}}s',
    xSeconds: '{{count}}s',
    halfAMinute: '30s',
    lessThanXMinutes: '{{count}}m',
    xMinutes: '{{count}}m',
    aboutXHours: '{{count}}h',
    xHours: '{{count}}h',
    xDays: '{{count}}d',
    aboutXWeeks: '{{count}}w',
    xWeeks: '{{count}}w',
    aboutXMonths: '{{count}}M',
    xMonths: '{{count}}M',
    aboutXYears: '{{count}}y',
    xYears: '{{count}}y',
    overXYears: '{{count}}y',
    almostXYears: '{{count}}y',
  };

  const formatDistance = (token, count, options) => {
    options = options || {};

    const result = formatDistanceLocale[token].replace('{{count}}', count);

    if (options.addSuffix) {
      if (options.comparison > 0) {
        return 'in ' + result;
      } else {
        return '> ' + result;
      }
    }

    return result;
  };

  // console.log(filtereditems);
  return (
    <section className="mb-5 relative">
      <Heading title={title}>
        {!notFound ? (
          filtereditems.list.map((item, idx) => {
            return (
              <div key={idx} className="cat-grid-container">
                <div className="cat-rule-num">{idx + 1}.</div>
                <div className="cat-rule-link">
                  <Link to={`${item.item.fields.slug}`}>
                    {item.item.frontmatter.title}
                  </Link>
                </div>
                <span className="block">
                  {filtereditems.filter.filter === FilterOptions.Le ||
                  filtereditems.filter.filter === FilterOptions.Re
                    ? formatDistanceToNow(
                        new Date(item.file.node.lastUpdated),
                        {
                          locale: {
                            ...locale,
                            formatDistance,
                          },
                          addSuffix: true,
                        }
                      )
                    : formatDistanceToNow(new Date(item.file.node.created), {
                        locale: {
                          ...locale,
                          formatDistance,
                        },
                        addSuffix: true,
                      })}
                </span>
              </div>
            );
          })
        ) : (
          <div>No Results...</div>
        )}
      </Heading>
    </section>
  );
};

const AllRules = ({ location, data }) => {
  const { state } = location;
  const [filter, setFilter] = useState();
  const [filtereditems, setFilteredItems] = useState({ list: [], filter: {} });
  const [history, setHistory] = useState(data.allHistoryJson.edges);
  const [rules, setRules] = useState(data.allMarkdownRemark.nodes);
  const [notFound, setNotFound] = useState(false);
  const [filterTitle, setFilterTitle] = useState('all rules - unsorted');

  useMount(() => {
    // console.log(state);
    if (state) {
      filterBySort({
        filter: state.filter,
        select: state.select,
        input: state.input,
      });
    } else {
      filterBySort({
        filter: FilterOptions.Nr,
        select: SelectOptions.All,
        input: null,
      });
    }
  });

  useEffect(() => {
    filterBySort(filter);
  }, [filter]);

  const filterBySort = (_filter) => {
    if (!_filter || _filter?.length === 0) {
      return;
    }

    const { filter, select, input } = _filter;

    if (!filter && !select) return;

    let timeSelect = new Date();

    switch (select) {
      case SelectOptions.Lw:
        timeSelect.setDate(timeSelect.getDate() - 7);
        break;
      case SelectOptions.Lm:
        timeSelect.setMonth(timeSelect.getMonth() - 1);
        break;
      case SelectOptions.L3m:
        timeSelect.setMonth(timeSelect.getMonth() - 3);
        break;
      case SelectOptions.L6m:
        timeSelect.setMonth(timeSelect.getMonth() - 6);
        break;
      case SelectOptions.Ly:
        timeSelect.setFullYear(timeSelect.getFullYear() - 1);
        break;
      case SelectOptions.Custom:
        timeSelect.setDate(timeSelect.getDate() - input);
        break;
      case SelectOptions.All:
        timeSelect = null;
        break;
    }
    setFilteredItems({});

    const foundRules = rules.map((item) => {
      //Todo(Jack): Depending on the speed - optimise this find
      let findRule = history.find(
        (r) => sanitizeName(r) === sanitizeName(item.fields.slug, true)
      );

      //Return if a rule isn't found in history.json or if its archived
      if (!findRule || item.frontmatter.archivedreason) return;

      if (!timeSelect) {
        return { item: item, file: findRule };
      } else {
        // console.log(timeSelect);
        if (filter === FilterOptions.Re || filter === FilterOptions.Le) {
          // console.log(`${new Date(findRule.node.lastUpdated)} | ${timeSelect}`);
          if (new Date(findRule.node.lastUpdated) >= timeSelect) {
            return { item: item, file: findRule };
          }
        } else {
          if (new Date(findRule.node.created) >= timeSelect) {
            return { item: item, file: findRule };
          }
        }
      }
    });

    //Remove undefined
    const filteredRules = foundRules.filter((i) => i !== undefined);

    const filterSort = filter === FilterOptions.Nr ? 1 : -1;

    setFilterTitle(
      `${filter} - ${select} ${input ? ' - Last ' + input + ' days' : ''}`
    );

    if (filteredRules.length === 0) {
      setNotFound(true);
      return;
    } else {
      setNotFound(false);
    }

    switch (filter) {
      case FilterOptions.Re:
        filteredRules.sort((a, b) => {
          if (a.file.node.lastUpdated < b.file.node.lastUpdated) return 1;
          if (a.file.node.lastUpdated > b.file.node.lastUpdated) return -1;
          return 0;
        });
        break;
      case FilterOptions.Le:
        filteredRules.sort((a, b) => {
          if (a.file.node.lastUpdated < b.file.node.lastUpdated) return -1;
          if (a.file.node.lastUpdated > b.file.node.lastUpdated) return 1;
          return 0;
        });
        break;
      default:
        filteredRules.sort((a, b) => {
          if (a.file.node.created < b.file.node.created) return filterSort;
          if (a.file.node.created > b.file.node.created)
            return filterSort ? -filterSort : filterSort;
          return 0;
        });
        break;
    }

    setFilteredItems({ list: filteredRules, filter: _filter });
  };

  const sanitizeName = (file, slug) => {
    const name = slug
      ? file.slice(1, file.length - 6)
      : file.node.file.slice(0, file.node.file.length - 8);
    return name;
  };

  return (
    <div className="w-full">
      <Breadcrumb title="All Rules" />

      <div className="container" id="rules">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-3/4 px-4">
            <span className="flex">
              <h2 className="flex-1">All Rules</h2>
              <div className="flex items-center align-middle">
                <Filter selected={setFilter} />
              </div>
            </span>
            <div className="rule-index archive no-gutters rounded">
              <AllRulesContent
                filtereditems={filtereditems}
                title={filterTitle}
                notFound={notFound}
              />
            </div>
          </div>
          <div className="w-full lg:w-1/4 px-4" id="sidebar">
            <SideBar ruleTotalNumber={rules.length} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const pageQuery = graphql`
  query latestRulesQuery {
    allHistoryJson {
      edges {
        node {
          created
          createdBy
          lastUpdated
          lastUpdatedBy
          file
        }
      }
    }
    allMarkdownRemark(filter: { frontmatter: { type: { eq: "rule" } } }) {
      nodes {
        frontmatter {
          title
          archivedreason
        }
        fields {
          slug
        }
      }
    }
  }
`;

export default AllRules;
