package com.buoybuddy.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestClient

@Configuration
class NdbcClientConfig {
    @Bean
    fun ndbcRestClient(): RestClient =
        RestClient.builder()
            .baseUrl("https://www.ndbc.noaa.gov/data/realtime2/")
            .build()
}
