import React, { Component } from "react";
import { withApollo } from "react-apollo";
import Link from "./Link";
import gql from "graphql-tag";

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
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
  }
`;

class Search extends Component {
  state = {
    links: [],
    filter: ""
  };

  render() {
    return (
      <div>
        <div>
          Search
          <input
            type="text"
            //set filter to inputted text
            onChange={event => this.setState({ filter: event.target.value })}
          />
          <button onClick={() => this._executeSearch()}>Ok</button>
        </div>
        {/*map each link to the link component */}
        {this.state.links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    );
  }
  _executeSearch = async () => {
    const filter = this.state.filter;
    //query the feed_search_query, passing in the filter
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter }
    });
    //retrieve the links
    const links = result.data.feed.links;
    this.setState({ links });
  };
}

export default withApollo(Search);
