package com.buoybuddy.dto

data class LoginRequest(val username: String, val password: String)

data class RegisterRequest(val username: String, val password: String)

data class UserResponse(val id: Long, val username: String)
