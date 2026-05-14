package com.bsgated.service;

import com.bsgated.dto.CreateDeliveryPassRequest;
import com.bsgated.dto.VerifyDeliveryOtpRequest;
import com.bsgated.model.DeliveryPass;
import com.bsgated.repository.DeliveryPassRepository;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DeliveryPassService {

    private final DeliveryPassRepository repo;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();

    public DeliveryPassService(DeliveryPassRepository repo, UserRepository userRepository, AuditService auditService) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    private String generateOTP() {
        return String.format("%06d", secureRandom.nextInt(1000000));
    }

    public DeliveryPass create(CreateDeliveryPassRequest req) {
        AuthenticatedUser currentUser = CurrentUser.get();
        DeliveryPass pass = new DeliveryPass();
        pass.setHostResidentId(String.valueOf(currentUser.id()));
        pass.setHostResidentName(resolveResidentName(currentUser, req));
        pass.setHostUnit(req.getHostUnit());
        pass.setProvider(req.getProvider());
        pass.setExpectedWindow(req.getExpectedWindow());
        pass.setDeliveryPersonName(req.getDeliveryPersonName());
        pass.setDeliveryPersonPhone(req.getDeliveryPersonPhone());
        pass.setOtp(generateOTP());
        pass.setStatus("PENDING");

        DeliveryPass saved = repo.save(pass);
        auditService.record("DELIVERY_PASS_CREATED", "DELIVERY_PASS", String.valueOf(saved.getId()), "Provider=" + saved.getProvider());
        return saved;
    }

    public List<DeliveryPass> getByCurrentResident() {
        AuthenticatedUser currentUser = CurrentUser.get();
        return repo.findByHostResidentIdOrderByCreatedAtDesc(String.valueOf(currentUser.id()));
    }

    public List<DeliveryPass> getPending() {
        return repo.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    public Optional<DeliveryPass> verifyOtp(VerifyDeliveryOtpRequest req) {
        AuthenticatedUser currentUser = CurrentUser.get();
        Optional<DeliveryPass> opt = repo.findByOtpAndStatus(req.getOtp(), "PENDING");
        opt.ifPresent(pass -> {
            pass.setStatus("OTP_VERIFIED");
            pass.setOtpVerifiedAt(LocalDateTime.now());
            pass.setVerifiedByGuardId(String.valueOf(currentUser.id()));
            repo.save(pass);
            auditService.record("DELIVERY_OTP_VERIFIED", "DELIVERY_PASS", String.valueOf(pass.getId()), "OTP verified by guard");
        });
        return opt;
    }

    public Optional<DeliveryPass> markDelivered(Long id) {
        AuthenticatedUser currentUser = CurrentUser.get();
        return repo.findById(id)
                .filter(pass -> "OTP_VERIFIED".equals(pass.getStatus()))
                .map(pass -> {
                    pass.setStatus("DELIVERED");
                    pass.setDeliveredAt(LocalDateTime.now());
                    pass.setVerifiedByGuardId(String.valueOf(currentUser.id()));
                    DeliveryPass saved = repo.save(pass);
                    auditService.record("DELIVERY_MARKED_DELIVERED", "DELIVERY_PASS", String.valueOf(saved.getId()), "Delivery completed by guard");
                    return saved;
                });
    }

    public Optional<DeliveryPass> cancel(Long id) {
        AuthenticatedUser currentUser = CurrentUser.get();
        String residentId = String.valueOf(currentUser.id());
        return repo.findById(id)
                .filter(pass -> "PENDING".equals(pass.getStatus()))
                .filter(pass -> residentId.equals(pass.getHostResidentId()))
                .map(pass -> {
                    pass.setStatus("CANCELLED");
                    pass.setCancelledAt(LocalDateTime.now());
                    DeliveryPass saved = repo.save(pass);
                    auditService.record("DELIVERY_PASS_CANCELLED", "DELIVERY_PASS", String.valueOf(saved.getId()), "Cancelled by resident");
                    return saved;
                });
    }

    private String resolveResidentName(AuthenticatedUser currentUser, CreateDeliveryPassRequest req) {
        return userRepository.findById(currentUser.id())
                .map(user -> user.getName() != null ? user.getName() : req.getHostResidentName())
                .orElse(req.getHostResidentName());
    }
}
