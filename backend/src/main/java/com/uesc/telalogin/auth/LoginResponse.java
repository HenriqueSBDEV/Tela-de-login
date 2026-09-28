package com.uesc.telalogin.auth;

public record LoginResponse(String accessToken, String tokenType, long expiresIn) {
}
