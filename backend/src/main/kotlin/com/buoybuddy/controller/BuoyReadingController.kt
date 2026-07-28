package com.buoybuddy.controller

import com.buoybuddy.model.BuoyReading
import com.buoybuddy.service.BuoyReadingService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/buoy-readings")
class BuoyReadingController(
    private val buoyReadingService: BuoyReadingService,
) {
    @GetMapping("/{userId:\\d+}")
    fun buoyReadings(@PathVariable userId: Long): List<BuoyReading> =
        buoyReadingService.getBuoyReadingsByUserId(userId)
}
