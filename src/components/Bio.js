import React from 'react'

// Import typefaces
import 'typeface-arimo'
import 'typeface-vt323'

import profilePic from './profile-pic.jpg'

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
          src="https://gravatar.com/userimage/16158166/c92946e36a5158cc0365e0c3538a6163.png?size=200"
          alt={`Leah`}
          style={{
            marginRight: '20px',
            marginBottom: 0,
            width: '85px'
          }}
        />
        <div>
          <p>Written by <strong>Leah</strong> who lives in the Utah mountains and builds things for the web.</p>
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
