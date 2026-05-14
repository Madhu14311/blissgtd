package com.bsgated.security;

public record AuthenticatedUser(Long id, String phone, String role) {
}
