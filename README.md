# Kukua Weather API

## Setup

```bash
git clone https://github.com/kukua/kukua-api.git
cd kukua-api
cp .env.example .env
chmod 600 .env
# > Edit .env
docker-compose run --rm api npm install
docker-compose up -d
```

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

GET /users/2?includes=config,groups.config
PUT /users/2/config/test {"value":{"a":1,"b":2}}
DELETE /users/2/config/test
GET /users/2/permissions/user.read.10 => 200/401
PUT /users/2/permissions/{user.read.10|entity.method.id}/{inherit|allow|deny}
PUT /users/2/groups/admin
DELETE /users/2/groups/admin

GET /userGroups
GET /userGroups/admin
PUT /userGroups/admin {"name":"Administrators"}
DELETE /userGroups/admin
PUT /userGroups/admin/permissions/{user.read.10|entity.method.id}/{inherit|allow|deny}

GET /jobs
PUT /jobs/job-name { "filter": ... }
POST /jobs/job-name/trigger # Trigger manually
DELETE /jobs/job-name

GET /forecasts?type=daily|hourly&location=1234&fields=windSpeed,tempLow&from=2016-12-01&to=2016-12-31&limit=10&order=-tempLow
GET /forecastLocations
GET /forecastLocations/1234
```
