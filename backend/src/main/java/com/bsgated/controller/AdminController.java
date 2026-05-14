package com.bsgated.controller;

import com.bsgated.exception.ApiException;
import com.bsgated.model.User;
import com.bsgated.repository.UserRepository;
import com.bsgated.security.AuthenticatedUser;
import com.bsgated.security.CurrentUser;
import com.bsgated.security.RoleName;
import com.bsgated.service.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminController(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping(value = "/pending", produces = "application/json")
    public List<User> getPendingUsers() {
        return userRepository.findByVerificationStatus("pending")
                .stream()
                .filter(u -> u.getRole() != null && List.of("resident", "vendor", "security").contains(u.getRole().toLowerCase()))
                .toList();
    }

    @GetMapping(value = "/superadmin/pending", produces = "application/json")
    public List<User> getSuperAdminPending() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getVerificationStatus() != null && List.of("pending", "not_submitted").contains(u.getVerificationStatus().toLowerCase()))
                .filter(u -> u.getRole() != null && List.of("admin", "builder", "superadmin", "super_admin").contains(u.getRole().toLowerCase()))
                .toList();
    }

    @GetMapping(value = "/users", produces = "application/json")
    public List<User> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() != null && List.of("resident", "vendor", "security").contains(u.getRole().toLowerCase()))
                .toList();
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        boolean approve = payload.getOrDefault("approve", true);
        AuthenticatedUser actor = CurrentUser.get();
        
        return userRepository.findById(id).map(user -> {
            ensureApprovalPermission(actor, user);
            if (approve) {
                user.setVerificationStatus("approved");
                user.setApprovalStatus("approved");
            } else {
                user.setVerificationStatus("rejected");
                user.setApprovalStatus("rejected");
            }
            userRepository.save(user);
            auditService.record("USER_" + (approve ? "APPROVED" : "REJECTED"),
                    "USER",
                    String.valueOf(user.getId()),
                    "Target role=" + user.getRole());
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void ensureApprovalPermission(AuthenticatedUser actor, User targetUser) {
        String actorRole = RoleName.normalize(actor.role());
        String targetRole = RoleName.normalize(targetUser.getRole());

        if ("ADMIN".equals(actorRole) && List.of("RESIDENT", "VENDOR", "SECURITY").contains(targetRole)) {
            return;
        }

        if ("SUPER_ADMIN".equals(actorRole) && List.of("ADMIN", "BUILDER").contains(targetRole)) {
            return;
        }

        throw new ApiException(HttpStatus.FORBIDDEN, "You are not allowed to approve this user type.");
    }
}
