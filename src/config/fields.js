const standard = (filter, aggregator, column, alias, max = 3000) => `${aggregator}(CASE WHEN ${column} > ${max} THEN NULL ELSE ${column} END) AS "${alias}"`

module.exports = {
	timestamp: (filter) => `(UNIX_TIMESTAMP(timestamp) - MOD(UNIX_TIMESTAMP(timestamp), ${filter.getInterval()})) AS timestamp`,
	temp:      (filter, aggregator, alias) => standard(filter, aggregator, 'temp', alias, 300),
	humid:     (filter, aggregator, alias) => standard(filter, aggregator, 'humid', alias, 100),
	rain:      (filter, aggregator, alias) => standard(filter, aggregator, 'rain', alias, 300),
	windDir:   (filter, aggregator, alias) => ({
		sql: `ROUND(
			(DEGREES(ATAN2(
				${aggregator}(CASE WHEN windSpeed > 1000 OR windDir < 0 OR windDir > 360 THEN NULL ELSE (windSpeed * SIN(RADIANS(windDir))) END),
				${aggregator}(CASE WHEN windSpeed > 1000 OR windDir < 0 OR windDir > 360 THEN NULL ELSE (windSpeed * COS(RADIANS(windDir))) END)
			)) + 360) % 360,
			0
		) AS "${alias}"`,
		columns: ['windSpeed', 'windDir'],
	}),
	windSpeed: (filter, aggregator, alias) => standard(filter, aggregator, 'windSpeed', alias, 300),
	gustDir:   (filter, aggregator, alias) => ({
		sql: `ROUND(,
			(DEGREES(ATAN2(
				${aggregator}(CASE WHEN gustSpeed > 1000 OR gustDir < 0 OR gustDir > 360 THEN NULL ELSE (gustSpeed * SIN(RADIANS(gustDir))) END),
				${aggregator}(CASE WHEN gustSpeed > 1000 OR gustDir < 0 OR gustDir > 360 THEN NULL ELSE (gustSpeed * COS(RADIANS(gustDir))) END)
			)) + 360) % 360,
			0
		) AS "${alias}"`,
		columns: ['gustSpeed', 'gustDir'],
	}),
	gustSpeed:      (filter, aggregator, alias) => standard(filter, aggregator, 'gustSpeed', alias, 300),
	bmpTemp:        (filter, aggregator, alias) => standard(filter, aggregator, 'bmpTemp', alias, 300),
	pressure:       (filter, aggregator, alias) => standard(filter, aggregator, 'pressure', alias, 2000),
	sht2xTemp:      (filter, aggregator, alias) => standard(filter, aggregator, 'sht2xTemp', alias, 300),
	sht2xHumid:     (filter, aggregator, alias) => standard(filter, aggregator, 'sht2xHumid', alias, 100),
	solarIrrad:     (filter, aggregator, alias) => standard(filter, aggregator, 'solarIrrad', alias, 3000),
	solarIrradMax:  (filter, aggregator, alias) => standard(filter, aggregator, 'solarIrradMax', alias, 3000),
	soilMoisture:   (filter, aggregator, alias) => standard(filter, aggregator, 'soilMoisture', alias, 1000),
	battery:        (filter, aggregator, alias) => standard(filter, aggregator, 'battery', alias, 5000),
	lightSensMax:   (filter, aggregator, alias) => standard(filter, aggregator, 'lightSensMax', alias, 1000),
	sigQual:        (filter, aggregator, alias) => standard(filter, aggregator, 'sigQual', alias, 1000),
	sigQualMinTime: (filter, aggregator, alias) => standard(filter, aggregator, 'sigQualMinTime', alias, 1000),
}
