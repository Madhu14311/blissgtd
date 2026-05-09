package com.bsgated.payload;

import lombok.Data;

public class OtpRequest {
    private String phoneNumber; // Format: +919876543210

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
