module.exports = {
  siteMetadata: {
    title: 'leah.world',
    author: 'Leah Loughran',
    description: 'Leah\'s blog',
    siteUrl: 'leah.world',
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages',
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-smartypants',
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-124851316-1`,
      },
    },
    `gatsby-plugin-feed`,
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
  ],
}
