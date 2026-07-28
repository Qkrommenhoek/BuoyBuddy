package com.buoybuddy.service

import com.buoybuddy.model.User
import com.buoybuddy.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    fun register(username: String, rawPassword: String): User {
        if (userRepository.findByUsername(username) != null) {
            throw IllegalArgumentException("Username already taken")
        }
        // PasswordEncoder.encode() is only null when the raw password is null, which
        // cannot happen here since rawPassword is a non-null String.
        val encodedPassword = requireNotNull(passwordEncoder.encode(rawPassword))
        val user = User(username = username, password = encodedPassword)
        return userRepository.save(user)
    }
}
