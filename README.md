# Kukua Weather API

## Routes

```
Auth: curl -v {url} -H 'X-Auth-Token: {token}'

GET /devices
GET /devices?groups=tanzania
GET /devices/abcdef0123456789

GET /devices/abcdef0123456789?includes=groups,template
PUT /devices/abcdef0123456789/groups/tanzania
DELETE /devices/abcdef0123456789/groups/tanzania
GET /deviceGroups?includes=devices

GET /measurements?devices=abcdef0123456789&deviceGroups=Tanzania&fields=timestamp,temp:avg&from=2016-12-01&to=2016-12-31&limit=100&order=-temp:avg

GET /users/2
PUT /users/2/config/test {"value":{"a":1,"b":2}}
DELETE /users/2/config/test

GET /jobs
PUT /jobs/job-name { "filter": ... }
POST /jobs/job-name/trigger # Trigger manually
DELETE /jobs/job-name
```
