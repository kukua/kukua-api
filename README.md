# Kukua Weather API

## Routes

```
GET /devices
#GET /devices?group=tanzania
GET /devices/abcdef0123456789

GET /devices/abcdef0123456789?include=groups
PUT /devices/abcdef0123456789/groups/tanzania
DELETE /devices/abcdef0123456789/groups/tanzania
GET /deviceGroups?include=devices

#GET /measurements?group=Tanzania&fields=temp:avg&from=2016-12-01
```
