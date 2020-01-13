import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

class CreateLink extends Component {
  //state stores inputted description and url
  state = {
    description: "",
    url: ""
  };

  handleDescription = event => {
    this.setState({ description: event.target.value });
  };

  handleUrl = event => {
    this.setState({ url: event.target.value });
  };
  render() {
    const description = this.state.description;
    const url = this.state.url;
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={description}
            onChange={this.handleDescription}
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={url}
            onChange={this.handleUrl}
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        {/* when the button is clicked, call the function */}
        <Mutation mutation={POST_MUTATION} variables={{ description, url }}>
          {postMutation => <button onClick={postMutation}>Submit</button>}
        </Mutation>
      </div>
    );
  }
}

export default CreateLink;
