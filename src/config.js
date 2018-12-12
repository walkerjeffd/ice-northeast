export default {
  development: {
    api: {
      url: 'http://localhost:8081/data/'
      // url: 'http://s3.amazonaws.com/ecosheds.org/ice-sheds/'
    }
  },
  production: {
    api: {
      url: 'http://s3.amazonaws.com/ecosheds.org/ice-sheds/'
    }
  }
}
