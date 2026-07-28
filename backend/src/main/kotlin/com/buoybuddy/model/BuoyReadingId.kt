package com.buoybuddy.model

import jakarta.persistence.Embeddable
import java.io.Serializable
import java.time.Instant

@Embeddable
data class BuoyReadingId(
    val userId: Long,
    val stationId: String,
    val timestamp: Instant,
) : Serializable
