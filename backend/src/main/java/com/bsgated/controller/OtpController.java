package com.bsgated.controller;

import com.bsgated.payload.OtpRequest;
import com.bsgated.payload.OtpVerificationRequest;
import com.bsgated.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/otp")
@CrossOrigin(origins = "*")
public class OtpController {

    @Autowired
    private OtpService otpService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody OtpRequest request) {
        String status = otpService.sendOtp(request.getPhoneNumber());
        Map<String, String> response = new HashMap<>();
        response.put("status", status);
        
        if (status.startsWith("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody OtpVerificationRequest request) {
        boolean isVerified = otpService.verifyOtp(request.getPhoneNumber(), request.getOtp());
        Map<String, Object> response = new HashMap<>();
        response.put("verified", isVerified);
        
        if (isVerified) {
            response.put("message", "OTP verified successfully!");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Invalid OTP or expired.");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
