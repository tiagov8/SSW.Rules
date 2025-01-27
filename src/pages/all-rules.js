import Filter, { FilterOptions } from '../components/filter/filter';
import React, { useEffect, useState } from 'react';

import AllRulesContent from '../components/all-rules-content/allRulesContent';
import Breadcrumb from '../components/breadcrumb/breadcrumb';
import SideBar from '../components/side-bar/side-bar';
import { graphql } from 'gatsby';
import { objectOf } from 'prop-types';
import qs from 'query-string';
import { sanitizeName } from '../helpers/sanitizeName';

const AllRules = ({ data, location }) => {
  const [filter, setFilter] = useState();
  const [notFound, setNotFound] = useState(false);
  const [filteredItems, setFilteredItems] = useState({ list: [], filter: {} });
  const [isAscending, setIsAscending] = useState(true);

  const filterTitle = 'Results';
  const history = data.allHistoryJson.edges;
  const rules = data.allMarkdownRemark.nodes;

  const queryStringSearch = qs.parse(location?.search, {
    parseNumbers: true,
  });

  const queryStringRulesListSize = (() => {
    if (!queryStringSearch.size) {
      return 10;
    } else {
      return queryStringSearch.size > 100 ? 100 : queryStringSearch.size;
    }
  })();

  useEffect(() => {
    filterAndSort(filter);
  }, [filter, isAscending]);

  const filterAndValidateRules = async () => {
    const foundRules = await rules.map((item) => {
      //TODO: Depending on the speed - optimise this find
      let findRule = history.find(
        (r) => sanitizeName(r) === sanitizeName(item.fields.slug, true)
      );

      //Return if a rule isn't found in history.json,if its archived or if we have reached the count
      if (!findRule || item.frontmatter.archivedreason) {
        return;
      }
      return { item: item, file: findRule };
    });

    //Remove undefined and Return results
    return foundRules.filter((i) => i !== undefined);
  };

  const sort = (_filter, filteredRules) => {
    switch (_filter) {
      case FilterOptions.DateCreated:
        filteredRules.sort((a, b) => {
          if (a.file.node.created < b.file.node.created) return 1;
          if (a.file.node.created > b.file.node.created) return -1;
          return 0;
        });
        break;
      case FilterOptions.DateEdited:
        filteredRules.sort((a, b) => {
          if (a.file.node.lastUpdated < b.file.node.lastUpdated) return 1;
          if (a.file.node.lastUpdated > b.file.node.lastUpdated) return -1;
          return 0;
        });
        break;
    }

    if (!isAscending) {
      filteredRules.reverse();
    }
  };

  const filterAndSort = async (_filter) => {
    if (!_filter) {
      return;
    }

    const filteredRules = await filterAndValidateRules();

    if (filteredRules.count === 0) {
      setNotFound(true);
      return;
    } else {
      setNotFound(false);
    }

    sort(_filter, filteredRules);

    //Only show the top x queryStringRulesListSize

    setFilteredItems({
      list: filteredRules.slice(0, queryStringRulesListSize),
      filter: _filter,
    });
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
                filteredItems={filteredItems}
                title={filterTitle}
                notFound={notFound}
                isAscending={isAscending}
                setIsAscending={setIsAscending}
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

AllRules.propTypes = {
  data: objectOf(Object),
  location: objectOf(Object),
};
