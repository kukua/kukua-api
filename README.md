# Kukua Weather API

## Routes

```
GET /devices
GET /devices?groups=tanzania
GET /devices/abcdef0123456789

GET /devices/abcdef0123456789?includes=groups
PUT /devices/abcdef0123456789/groups/tanzania
DELETE /devices/abcdef0123456789/groups/tanzania
GET /deviceGroups?includes=devices

#GET /measurements?group=Tanzania&fields=temp:avg&from=2016-12-01
```
