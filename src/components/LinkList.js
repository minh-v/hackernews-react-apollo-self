import React, { Component } from "react";
import Link from "./Link";
import { Query } from "react-apollo";
import gql from "graphql-tag";

//query as a javascript constant using gql parser function
const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
      }
    }
  }
`;

class LinkList extends Component {
  render() {
    //pass GraphQL query to query prop,
    //and provide function as its child that returns UI
    //map each link from data from query to to a link component
    return (
      <Query query={FEED_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading..</div>;
          if (error) return <div>Error {error.message}</div>;

          //const linksToRender = data.feed.links;
          return (
            <div>
              {data.feed.links.map(link => (
                <Link key={link.id} link={link} />
              ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
