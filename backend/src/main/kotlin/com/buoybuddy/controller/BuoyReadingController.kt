package com.buoybuddy.controller

import com.buoybuddy.model.BuoyReading
import com.buoybuddy.service.BuoyReadingService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController
import org.springframework.http.HttpStatus

@RestController
@RequestMapping("/api/buoy-readings")
class BuoyReadingController(
    private val buoyReadingService: BuoyReadingService,
) {
    @GetMapping("/{userId:\\d+}")
    fun buoyReadings(@PathVariable userId: Long): List<BuoyReading> =
        buoyReadingService.getBuoyReadingsByUserId(userId)

    @PostMapping("/create-buoy-reading")
    fun createBuoyReading(@RequestBody buoyReading: BuoyReading): ResponseEntity<BuoyReading> {
        val saved = buoyReadingService.saveBuoyReading(buoyReading)
        return ResponseEntity.status(HttpStatus.CREATED).body(saved)
}
}
