// React
import React from 'react';
// GraphQL
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import _ from 'lodash';

const GetRepositoryInfoQuery = gql`
  query GetRepositoryIssues($owner: String!, $name: String!) {
      repository(owner: $owner,name: $name){
           issues(last:6,orderBy: { field: CREATED_AT, direction: DESC }){
        edges{
          node{
            title
            body
            author
              {
               login
               avatarUrl
              }

          createdAt
            }
cursor

              }
              pageInfo {
                hasPreviousPage
              }
            }
      }
    }

`;
//console.log(JSON.stringify(GetRepositoryInfoQuery, null, '\t'));
const withInfo = graphql(GetRepositoryInfoQuery, {
  options: ({ owner, name }) => {
    return {
      variables: {
        owner: 'Wynncraft',
        name: 'Issues'
      }
    }
  },
  props: ({ data }) => {
    // loading state
    if (data.loading) {
      return { loading: true, fetchNextPage: () => {} };
    }

    // error state
    if (data.error) {
      console.error(data.error);
    }

const fetchNextPage = () => {
      return data.fetchMore({
          variables: {
          before: _.first(data.repositoryOwner.repository.issues.edges).cursor,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          return {
            repositoryOwner: {
              repository: {
                issues: {
                  // Append new issues to the front of the list, since we're
                  // paginating backwards
                  edges: [
                    ...fetchMoreResult.data.repositoryOwner.repository.issues.edges,
                    ...previousResult.repositoryOwner.repository.issues.edges,
                  ],
                  pageInfo: fetchMoreResult.data.repositoryOwner.repository.issues.pageInfo,
                }
              }
            }
          }
        }
      })
    }

console.log(data.repositoryOwner.repository.issues.edges);
    return {
      // We don't want our UI component to be aware of the special shape of
      // GraphQL connections, so we transform the props into a simple array
      // directly in the container. We also reverse the list since we want to
      // start from the most recent issue and scroll down
      issues: [...data.repositoryOwner.repository.issues.edges.map(({ node }) => node)].reverse(),
      hasNextPage: data.repositoryOwner.repository.issues.pageInfo.hasPreviousPage,
      fetchNextPage,
    };
  },
});

// Repository
class Repository extends React.Component {
  constructor(props) {
    super(props);


//const ds = props.issues[0];
  console.log('props value: ');
console.log(JSON.stringify(props, null, '\t'));
/*render() {
  return (<div>
    <h2>{this.state.login}/{this.state.name}</h2>
      <ul>
        {ds}
      </ul>
  </div>)
} */
   // states
    this.state = {
      login: props.login,
      name: props.name,
      stargazers: 0,
      watchers: 0,
    };
  }

  componentWillReceiveProps(newProps) {
    // DRY
    const repo = newProps.data.repositoryOwner.repository;

    // states
    this.setState({
      login: this.props.login,
      name: this.props.name,
      stargazers: repo.stargazers.totalCount,
      watchers: repo.watchers.totalCount
    });
  }

  render() {
    console.log('Rendering');
    return (<div>
      <h2>{this.state.login}/{this.state.name}</h2>
        <ul>
          //{newProps.repositoryOwner.repository.issues.edges}
        </ul>
    </div>)
  }
}

const RepositoryWithInfo = withInfo(Repository);
export default RepositoryWithInfo;
