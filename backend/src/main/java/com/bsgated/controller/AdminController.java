package com.bsgated.controller;

import com.bsgated.model.User;
import com.bsgated.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

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
                .filter(u -> u.getRole() != null && List.of("admin", "builder").contains(u.getRole().toLowerCase()))
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
        
        return userRepository.findById(id).map(user -> {
            if (approve) {
                user.setVerificationStatus("approved");
                user.setApprovalStatus("approved");
            } else {
                user.setVerificationStatus("rejected");
                user.setApprovalStatus("rejected");
            }
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }
}
