import React from 'react'
import Link from 'gatsby-link'
import './index.css'
import 'prismjs/themes/prism.css'

class Template extends React.Component {
  render() {
    const { location, children } = this.props
    let header

    let rootPath = `/`
    if (typeof __PREFIX_PATHS__ !== `undefined` && __PREFIX_PATHS__) {
      rootPath = __PATH_PREFIX__ + `/`
    }

    if (location.pathname === rootPath) {
      header = (
        <h1
          style={{
            fontSize: '70px',
            marginBottom: '40px',
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: 'inherit',
            }}
            to={'/'}
          >
            leah.world
          </Link>
        </h1>
      )
    } else {
      header = (
        <h3
          style={{
            marginTop: 0
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: 'inherit',
            }}
            to={'/'}
          >
            leah.world
          </Link>
        </h3>
      )
    }
    return (
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: '690px',
          padding: '20px 10px',
        }}
      >
        {header}
        {children()}
      </div>
    )
  }
}

export default Template
