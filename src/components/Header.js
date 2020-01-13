import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";

class Header extends Component {
  render() {
    return (
      <div className="flex pa1 justify-between nowrap orange">
        <div className="flex flex-fixed black">
          <div className="fw7 mr1">Hacker News</div>
          {/* Navigate to LinkList component*/}
          <Link to="/" className="ml1 no-underline black">
            new
          </Link>
          <div className="ml1">|</div>
          {/* Navigate to CreateLink component*/}
          <Link to="/create" className="ml1 no-underline black">
            submit
          </Link>
        </div>
      </div>
    );
  }
}

export default withRouter(Header);
