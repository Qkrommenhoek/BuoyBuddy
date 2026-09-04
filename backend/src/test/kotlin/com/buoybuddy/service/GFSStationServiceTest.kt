package com.buoybuddy.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.web.client.RestClient
import java.time.Instant
import java.time.LocalDate

class GFSStationServiceTest {

    // parseCbull and candidateCycles do no I/O, so a client with no configured base URL is fine here.
    private val gfsStationService = GFSStationService(RestClient.create())

    @Test
    fun `parses station header, cycle and a row with multiple swell systems`() {
        val rawText = """
            Location : 46239      (36.34N 122.10W)
            Model    : spectral resolution for points
            Cycle    : 20260904 12 UTC

            DDHH HS SS PP DDD SS PP DDD SS PP DDD SS PP DDD
            -------------------------------------------------------------------
            0412  5  4 10 303  2 11 195  2 18 204  1 16 225
            -------------------------------------------------------------------
            DD  = Day of Month
            HH  = Hour of Day
        """.trimIndent()

        val forecast = gfsStationService.parseCbull(rawText, "https://example.com/gfswave.46239.cbull")

        assertEquals("46239", forecast.stationId)
        assertEquals(36.34, forecast.latitude, 0.0001)
        assertEquals(-122.10, forecast.longitude, 0.0001)
        assertEquals(Instant.parse("2026-09-04T12:00:00Z"), forecast.cycle)
        assertEquals("https://example.com/gfswave.46239.cbull", forecast.sourceUrl)

        val row = forecast.rows.single()
        assertEquals(Instant.parse("2026-09-04T12:00:00Z"), row.time)
        assertEquals(5, row.totalWaveHeightFt)
        assertEquals(4, row.systems.size)
        assertEquals(4, row.systems[0].waveHeightFt)
        assertEquals(10, row.systems[0].periodSec)
        assertEquals(303, row.systems[0].directionDeg)
    }

    @Test
    fun `rolls the month over when the DDHH day number decreases`() {
        val rawText = """
            Location : 46239      (36.34N 122.10W)
            Cycle    : 20260129 18 UTC

            DDHH HS SS PP DDD
            -------------------------------------------------------------------
            2918  5  4 10 303
            2919  5  4 10 303
            0100  5  4 10 303
            0101  5  4 10 303
        """.trimIndent()

        val forecast = gfsStationService.parseCbull(rawText, "https://example.com/gfswave.46239.cbull")

        assertEquals(4, forecast.rows.size)
        assertEquals(Instant.parse("2026-01-29T18:00:00Z"), forecast.rows[0].time)
        assertEquals(Instant.parse("2026-01-29T19:00:00Z"), forecast.rows[1].time)
        assertEquals(Instant.parse("2026-02-01T00:00:00Z"), forecast.rows[2].time)
        assertEquals(Instant.parse("2026-02-01T01:00:00Z"), forecast.rows[3].time)
    }

    @Test
    fun `rejects text that is missing the Location or Cycle header lines`() {
        assertThrows(IllegalStateException::class.java) {
            gfsStationService.parseCbull("not a header\nrow one", "https://example.com")
        }
    }

    @Test
    fun `candidateCycles walks backwards through 6-hourly cycles from the floored hour`() {
        val now = Instant.parse("2026-09-04T19:15:00Z")

        val cycles = gfsStationService.candidateCycles(now)

        val expectedDate = LocalDate.of(2026, 9, 4)
        assertEquals(
            listOf(
                expectedDate to 18,
                expectedDate to 12,
                expectedDate to 6,
                expectedDate to 0,
            ),
            cycles,
        )
    }

    @Test
    fun `candidateCycles crosses a day boundary when the floored hour is 00`() {
        val now = Instant.parse("2026-09-04T02:00:00Z")

        val cycles = gfsStationService.candidateCycles(now)

        assertEquals(
            listOf(
                LocalDate.of(2026, 9, 4) to 0,
                LocalDate.of(2026, 9, 3) to 18,
                LocalDate.of(2026, 9, 3) to 12,
                LocalDate.of(2026, 9, 3) to 6,
            ),
            cycles,
        )
    }
}
