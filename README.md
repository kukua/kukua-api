# Kukua Weather API

## Routes

```
Auth: curl -v {url} -H 'Authorization: Token {token}'

GET /devices
GET /devices?groups=tanzania
GET /devices/abcdef0123456789

GET /devices/abcdef0123456789?includes=groups,template
PUT /devices/abcdef0123456789/groups/tanzania
DELETE /devices/abcdef0123456789/groups/tanzania
GET /deviceGroups?includes=devices

GET /measurements?groups=Tanzania&fields=timestamp,temp:avg&from=2016-12-01&to=2016-12-31&limit=100

GET /users/2
PUT /users/2/config/test {"value":{"a":1,"b":2}}
DELETE /users/2/config/test

GET /jobs
```
