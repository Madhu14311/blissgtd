package com.bsgated.service;

import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.verify.sid}")
    private String verifySid;

    @PostConstruct
    public void init() {
        // Initialize Twilio with your Account SID and Auth Token
        Twilio.init(accountSid, authToken);
    }

    public String sendOtp(String phoneNumber) {
        try {
            Verification verification = Verification.creator(
                    verifySid,
                    phoneNumber,
                    "sms"
            ).create();
            return verification.getStatus();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public boolean verifyOtp(String phoneNumber, String otp) {
        try {
            VerificationCheck verificationCheck = VerificationCheck.creator(verifySid)
                    .setCode(otp)
                    .setTo(phoneNumber)
                    .create();
            return "approved".equalsIgnoreCase(verificationCheck.getStatus());
        } catch (Exception e) {
            return false;
        }
    }
}
