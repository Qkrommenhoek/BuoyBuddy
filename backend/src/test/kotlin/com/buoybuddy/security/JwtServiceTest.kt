package com.buoybuddy.security

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.security.core.userdetails.User as SpringUser

class JwtServiceTest {

    private val jwtService = JwtService("5367566859703373367639792F423F452848284D6251655468576D5A71347437")

    @Test
    fun `generated token round-trips to the same username`() {
        val token = jwtService.generateToken("quinn")

        assertEquals("quinn", jwtService.extractUsername(token))
    }

    @Test
    fun `validateToken succeeds for the matching, unexpired user`() {
        val token = jwtService.generateToken("quinn")
        val userDetails = SpringUser("quinn", "irrelevant", emptyList())

        assertTrue(jwtService.validateToken(token, userDetails))
    }

    @Test
    fun `validateToken fails when the username does not match the token subject`() {
        val token = jwtService.generateToken("quinn")
        val otherUser = SpringUser("someone-else", "irrelevant", emptyList())

        assertFalse(jwtService.validateToken(token, otherUser))
    }
}
