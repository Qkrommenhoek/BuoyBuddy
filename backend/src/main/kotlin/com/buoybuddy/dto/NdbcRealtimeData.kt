package com.buoybuddy.dto

data class NdbcRealtimeData(
    val columns: List<String>,
    val units: List<String>,
    val data: Map<String, List<String?>>,
)
