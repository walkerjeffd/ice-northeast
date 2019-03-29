export default {
  development: {
    api: {
      url: 'http://localhost:8081/data/'
    }
  },
  production: {
    api: {
      url: 'https://s3.amazonaws.com/ecosheds.org/ice-sheds/'
    }
  }
}
