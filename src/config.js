export default {
  development: {
    api: {
      url: 'http://localhost:8081/data/'
    }
  },
  production: {
    api: {
      url: 'https://ecosheds.org.s3.amazonaws.com/ice-sheds/'
    }
  }
}
