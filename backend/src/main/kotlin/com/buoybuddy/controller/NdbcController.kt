package com.buoybuddy.controller

import com.buoybuddy.dto.NdbcRealtimeData
import com.buoybuddy.service.NdbcService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/ndbc")
class NdbcController(
    private val ndbcService: NdbcService,
) {
    @GetMapping("/{stationId:[A-Za-z0-9]+}.txt")
    fun stationRaw(@PathVariable stationId: String): String = ndbcService.fetchRealtime2(stationId)

    @GetMapping("/{stationId:[A-Za-z0-9]+}/parsed")
    fun stationParsed(@PathVariable stationId: String): NdbcRealtimeData =
        ndbcService.fetchRealtime2Parsed(stationId)
}
