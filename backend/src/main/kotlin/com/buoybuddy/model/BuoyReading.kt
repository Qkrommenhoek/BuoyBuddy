package com.buoybuddy.model

import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity

@Entity
class BuoyReading(
    @EmbeddedId
    val id: BuoyReadingId,
    val wvht: Double,
    val dpd: Double,
    val apd: Double,
    val wvdir: Double,
    val cleanRating: Int,
    val powerRating: Int,
) {
    // The composite id is assigned at construction time (not generated), so
    // it is a stable, safe basis for equality even before persisting.
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is BuoyReading) return false
        return id == other.id
    }

    override fun hashCode(): Int = id.hashCode()
}
