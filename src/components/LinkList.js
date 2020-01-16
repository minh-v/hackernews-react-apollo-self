import React, { Component } from "react";
import Link from "./Link";
import { Query } from "react-apollo";
import gql from "graphql-tag";

//query as a javascript constant using gql parser function
export const FEED_QUERY = gql`
  {
    feed {
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
    }
  }
`;

class LinkList extends Component {
  _updateCacheAfterVote = (store, createVote, linkId) => {
    //retrieve current state of cached data for FEED_QUERY from store
    const data = store.readQuery({ query: FEED_QUERY });

    //find the link that the user just upvoted, change the votes to the votes that was passed and therefore rerendering
    const votedLink = data.feed.links.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    //write the data back into the store
    store.writeQuery({ query: FEED_QUERY, data });
  };

  render() {
    //pass GraphQL query to query prop,
    //and provide function as its child that returns UI
    //result of the query passed by query component as parameter object
    //map each link from data from query to to a link component
    return (
      <Query query={FEED_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading..</div>;
          if (error) return <div>Error {error.message}</div>;

          //const linksToRender = data.feed.links;
          return (
            <div>
              {data.feed.links.map((link, index) => (
                <Link
                  key={link.id}
                  link={link}
                  index={index}
                  updateStoreAfterVote={this._updateCacheAfterVote}
                />
              ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
