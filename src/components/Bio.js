import React from 'react'

// Import typefaces
import 'typeface-arimo'
import 'typeface-vt323'

class Bio extends React.Component {
  render() {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '52px',
        }}
      >
        <img
          src="https://secure.gravatar.com/avatar/fbf70208a8c63e02f7294de0d0c2834f?size=200"
          alt={`Leah`}
          style={{
            marginRight: '20px',
            marginBottom: 0,
            width: '85px'
          }}
        />
        <div>
          <p>Written by <strong>Leah</strong> who lives in Detroit and builds things for the web.</p>
          <p>
            <a href="https://twitter.com/leahjlou">
              Twitter
            </a>
            {' / '}
            <a href="https://github.com/leahjlou">
              GitHub
            </a>
            {' / '}
            <a href="https://linkedin.com/in/leahjlou">
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    )
  }
}

export default Bio
