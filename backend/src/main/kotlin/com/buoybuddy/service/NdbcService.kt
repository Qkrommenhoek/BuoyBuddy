package com.buoybuddy.service

import com.buoybuddy.dto.NdbcRealtimeData
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException

@Service
class NdbcService(
    private val ndbcRestClient: RestClient,
) {
    fun fetchRealtime2(stationId: String): String =
        try {
            ndbcRestClient.get()
                .uri("{stationId}.txt", stationId)
                .retrieve()
                .body(String::class.java) ?: throw IllegalStateException("NDBC returned an empty response")
        } catch (exception: RestClientException) {
            throw IllegalStateException("Failed to fetch data from NDBC for station $stationId", exception)
        }

    fun fetchRealtime2Parsed(stationId: String): NdbcRealtimeData =
        parseRealtime2(fetchRealtime2(stationId))

    internal fun parseRealtime2(rawText: String): NdbcRealtimeData {
        val lines = rawText.lineSequence()
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .toList()

        require(lines.size >= 2 && lines[0].startsWith("#") && lines[1].startsWith("#")) {
            "Unexpected NDBC realtime2 format: missing header lines"
        }

        val columns = lines[0].removePrefix("#").trim().split(WHITESPACE)
        val units = lines[1].removePrefix("#").trim().split(WHITESPACE)

        val columnData: Map<String, MutableList<String?>> =
            columns.associateWith { mutableListOf() }

        for (line in lines.drop(2)) {
            if (line.startsWith("#")) continue
            val tokens = line.split(WHITESPACE)
            if (tokens.size != columns.size) continue
            tokens.forEachIndexed { index, token ->
                columnData.getValue(columns[index]).add(if (token == MISSING_VALUE) null else token)
            }
        }

        return NdbcRealtimeData(
            columns = columns,
            units = units,
            data = columnData,
        )
    }

    private companion object {
        private val WHITESPACE = "\\s+".toRegex()
        private const val MISSING_VALUE = "MM"
    }
}
