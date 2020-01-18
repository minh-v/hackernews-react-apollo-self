import React, { Component, Fragment } from "react";
import Link from "./Link";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { LINKS_PER_PAGE } from "../constants";

//query as a javascript constant using gql parser function
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

class LinkList extends Component {
  _updateCacheAfterVote = (store, createVote, linkId) => {
    //no longer works beacuse readQuery expects different variables
    //retrieve current state of cached data for FEED_QUERY from store
    //const data = store.readQuery({ query: FEED_QUERY });
    //figure out if the user is on new or top route
    const isNewPage = this.props.location.pathname.includes("new");
    const page = parseInt(this.props.match.params.page, 10);

    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const orderBy = isNewPage ? "createdAt_DESC" : null;
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });

    //find the link that the user just upvoted, change the votes to the votes that was passed and therefore rerendering
    const votedLink = data.feed.links.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    //write the data back into the store
    store.writeQuery({ query: FEED_QUERY, data });
  };

  _subscribeToNewLinks = subscribeToMore => {
    subscribeToMore({
      //the subscription query, fire every time a new link is created
      document: NEW_LINKS_SUBSCRIPTION,
      //retrieve the new link, merge into list of links and return the result
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newLink = subscriptionData.data.newLink;
        const exists = prev.feed.links.find(({ id }) => id === newLink.id);
        if (exists) return prev;
        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        });
      }
    });
  };

  _subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION
    });
  };

  _getQueryVariables = () => {
    //check if newpage
    const isNewPage = this.props.location.pathname.includes("new");
    const page = parseInt(this.props.match.params.page, 10);

    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const orderBy = isNewPage ? "createdAt_DESC" : null;
    return { first, skip, orderBy };
  };

  _getLinksToRender = data => {
    const isNewPage = this.props.location.pathname.includes("new");
    if (isNewPage) {
      return data.feed.links;
    }
    //sort list according to votes and returing the top 10
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };

  //when user presses next
  _nextPage = data => {
    //get the current page
    const page = parseInt(this.props.match.params.page, 10);
    //make sure there is a next page, if there is then load the next page
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  };

  //when user presses previous
  _previousPage = () => {
    //get current page
    const page = parseInt(this.props.match.params.page, 10);
    //load previous page
    if (page > 1) {
      const previousPage = page - 1;
      this.props.history.push(`/new/${previousPage}`);
    }
  };

  render() {
    //pass GraphQL query to query prop,
    //and provide function as its child that returns UI
    //result of the query passed by query component as parameter object
    //map each link from data from query to to a link component
    return (
      <Query query={FEED_QUERY} variables={this._getQueryVariables()}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Loading..</div>;
          if (error) return <div>Error {error.message}</div>;

          //open up websocket connection to subscription server
          this._subscribeToNewLinks(subscribeToMore);
          this._subscribeToNewVotes(subscribeToMore);

          //get links
          const linksToRender = this._getLinksToRender(data);
          const isNewPage = this.props.location.pathname.includes("new");
          const pageIndex = this.props.match.params.page
            ? (this.props.match.params.page - 1) * LINKS_PER_PAGE
            : 0;

          return (
            <Fragment>
              {linksToRender.map((link, index) => (
                <Link
                  key={link.id}
                  link={link}
                  index={index + pageIndex}
                  updateStoreAfterVote={this._updateCacheAfterVote}
                />
              ))}
              {isNewPage && (
                <div className="flex ml4 mv3 gray">
                  <div className="pointer mr2" onClick={this._previousPage}>
                    Previous
                  </div>
                  <div className="pointer" onClick={() => this._nextPage(data)}>
                    Next
                  </div>
                </div>
              )}
            </Fragment>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
