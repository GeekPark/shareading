# shareading

[![Build Status](https://travis-ci.org/GeekPark/shareading.svg?branch=master)](https://travis-ci.org/GeekPark/shareading)
[![Code Climate](https://codeclimate.com/github/GeekPark/shareading/badges/gpa.svg)](https://codeclimate.com/github/GeekPark/shareading)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
### Building & Testing

``` bash

yarn install

npm run dev

npm run prod

npm run test

npm run doc
# open the browser: http://127.0.0.1:3000

standard

```

### Deploy
``` bash
pm2 deploy processes.json production setup

// cp config.example.json config.json

pm2 deploy processes.json production
```
