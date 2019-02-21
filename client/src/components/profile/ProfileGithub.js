import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

class ProfileGithub extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: '1d99a35d9f6461a12004',
      clientSecret: '8cca158f79f3cac078ba62d54f5fc73fa434f78a',
      count: 5,
      sort: 'created: asc',
      repos: []
    }
  }

  componentDidMount(){
    const {username} = this.props;
    const {count, sort, clientId, clientSecret} = this.state;

    fetch(`https://api.github.com/users/${username}/repos?per_page=${count}&sort=${sort}&client_id=${clientId}&client_secret=${clientSecret}`)
      .then(res => res.json())
      .then(data => {

        // didn't get the same error as brad, but this if statement was added
        // if(this.refs.myRef){
        //   this.setState({repos: data })
        // }

          // without if
          this.setState({repos: data })

      }).catch(err => console.log(err))

  }
  render () {
    const {repos} = this.state;

    const repoItems = repos.map(repo => (
      <div className="card card-body mb-2" key={repo.id}>
        <div className="row">
          <div className="col-md-6">
            <h4>
              <Link
                to={repo.html_url}
                className="text-info"
                target="_blank">
                {repo.name}
              </Link>
            </h4>
            <p>{repo.description}</p>
          </div>
          <div className="col-md-6">
            <span className="badge badge-info mr-1">
              Stars: {repo.stargazers_count}
            </span>
            <span className="badge badge-secondary mr-1">
              Waters: {repo.watchers_count}
            </span>
            <span className="badge badge-success">
              Forks: {repo.forks_count}
            </span>
          </div>
        </div>
      </div>
    ))
    return (
      /* ref added, may not be needed
      <div ref="myRef">*/
      <div>
        <hr/>
        <h3 className="mb-4">Latest github Repos</h3>
        {repoItems}
      </div>
    );
  }
}

ProfileGithub.propTypes = {
  username: PropTypes.string.isRequired
}

export default ProfileGithub;
