package com.bsgated.controller;

import com.bsgated.model.User;
import com.bsgated.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping(value = "/register", produces = "application/json")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByPhone(user.getPhone()).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User already exists with this phone number.");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Set initial verification status
        if (user.getRole() != null && (user.getRole().equalsIgnoreCase("admin") || user.getRole().equalsIgnoreCase("builder"))) {
            user.setVerificationStatus("pending");
        } else {
            user.setVerificationStatus("not_submitted");
        }
        
        // In a real app, you would hash the password here
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping(value = "/login", produces = "application/json")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String phone = credentials.get("phone");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByPhone(phone);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.ok(userOpt.get());
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Invalid phone or password.");
        return ResponseEntity.status(401).body(response);
    }

    @GetMapping(value = "/status/{id}", produces = "application/json")
    public ResponseEntity<?> getStatus(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/submit-docs/{id}", produces = "application/json")
    public ResponseEntity<?> submitDocs(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return userRepository.findById(id).map(user -> {
            user.setVerificationStatus("pending");
            if (payload.containsKey("documents")) {
                user.setDocumentsJson(payload.get("documents").toString());
            }
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }
}
