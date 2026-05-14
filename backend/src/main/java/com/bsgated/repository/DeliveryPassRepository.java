// src/main/java/com/bsgated/repository/DeliveryPassRepository.java
package com.bsgated.repository;

import com.bsgated.model.DeliveryPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPassRepository extends JpaRepository<DeliveryPass, Long> {

    // Resident: all my passes, newest first
    List<DeliveryPass> findByHostResidentIdOrderByCreatedAtDesc(String hostResidentId);

    // Guard: all PENDING passes
    List<DeliveryPass> findByStatusOrderByCreatedAtDesc(String status);

    // Guard: OTP verification — only matches PENDING passes
    Optional<DeliveryPass> findByOtpAndStatus(String otp, String status);
}
