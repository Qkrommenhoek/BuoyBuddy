package com.buoybuddy.service

import com.buoybuddy.model.BuoyReading
import com.buoybuddy.repository.BuoyReadingRepository
import org.springframework.stereotype.Service

@Service
class BuoyReadingService(
    private val buoyReadingRepository: BuoyReadingRepository,
) {
    fun getBuoyReadingsByUserId(userId: Long): List<BuoyReading> =
        buoyReadingRepository.findByIdUserId(userId)
    
    fun saveBuoyReading(buoyReading: BuoyReading): BuoyReading =
        buoyReadingRepository.save(buoyReading)
}
