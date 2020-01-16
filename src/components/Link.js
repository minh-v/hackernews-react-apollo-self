import React, { Component } from "react";
import { AUTH_TOKEN } from "../constants";
import { timeDifferenceForDate } from "../utils";

class Link extends Component {
  render() {
    //get auth token from local storage
    const authToken = localStorage.getItem(AUTH_TOKEN);
    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          {/*index for the position to render on the list */}
          <span className="gray">{this.props.index + 1}.</span>
          {/*if user is signed in, allow them to see the vote button and vote*/}
          {authToken && (
            <div className="ml1 gray f11" onClick={() => this._voteForLink()}>
              ▲
            </div>
          )}
        </div>
        <div className="ml1">
          <div>
            {this.props.link.description} ({this.props.link.url})
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.votes.length} votes | by{" "}
            {/*if link has no user, unknown */}
            {this.props.link.postedBy
              ? this.props.link.postedBy.name
              : "Unknown"}{" "}
            {timeDifferenceForDate(this.props.link.createdAt)}
          </div>
        </div>
      </div>
    );
  }
}

export default Link;
