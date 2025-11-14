module.exports = function (options, webpack) {
  return {
    ...options,
    externals: {
      'bcrypt': 'commonjs bcrypt',
      '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
    },
    resolve: {
      ...options.resolve,
      fallback: {
        ...options.resolve?.fallback,
        'mock-aws-s3': false,
        'aws-sdk': false,
        'nock': false,
      },
    },
  };
};


