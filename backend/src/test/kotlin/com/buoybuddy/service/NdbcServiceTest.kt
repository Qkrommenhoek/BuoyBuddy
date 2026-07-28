package com.buoybuddy.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.web.client.RestClient

class NdbcServiceTest {

    // parseRealtime2 does no I/O, so a client with no configured base URL is fine here.
    private val ndbcService = NdbcService(RestClient.create())

    @Test
    fun `parses NDBC realtime2 text into columns, units and rows, mapping MM to null`() {
        val rawText = """
            #YY  MM DD hh mm WVHT WWH
            #yr  mo dy hr mn    m    m
            2026 07 19 20 00 1.20   MM
        """.trimIndent()

        val parsed = ndbcService.parseRealtime2(rawText)

        assertEquals(listOf("YY", "MM", "DD", "hh", "mm", "WVHT", "WWH"), parsed.columns)
        assertEquals("1.20", parsed.data.getValue("WVHT").single())
        assertNull(parsed.data.getValue("WWH").single())
    }

    @Test
    fun `rejects text that is missing the two header lines`() {
        assertThrows(IllegalArgumentException::class.java) {
            ndbcService.parseRealtime2("not a header\nrow one")
        }
    }
}
