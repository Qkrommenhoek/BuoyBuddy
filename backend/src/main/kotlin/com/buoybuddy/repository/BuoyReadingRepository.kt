package com.buoybuddy.repository

import com.buoybuddy.model.BuoyReading
import com.buoybuddy.model.BuoyReadingId
import org.springframework.data.jpa.repository.JpaRepository

interface BuoyReadingRepository : JpaRepository<BuoyReading, BuoyReadingId> {
    fun findByIdUserId(userId: Long): List<BuoyReading>
}
