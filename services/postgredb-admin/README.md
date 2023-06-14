# API Test


# /query

```
curl -X 'POST' 'http://localhost:8000/query' -H 'accept: application/json' -H 'Content-Type: application/x-www-form-urlencoded' -d 'url=localhost&port=8729&database=refinery&gQuery=match%20%24a%20isa%20log%2C%20has%20logName%20%22L1%22%3B%20%24b%20isa%20event%2C%20has%20eventName%20%24c%3B%20%24d%20(owner%3A%20%24a%2C%20item%3A%20%24b)%20isa%20trace%2C%20has%20traceId%20%24e%2C%20has%20index%20%24f%3B%20get%20%24a%2C%20%24b%2C%20%24c%2C%20%24d%2C%20%24e%2C%20%24f%3B%20offset%200%3B%20limit%20100%3B'
```
