package com.bsgated.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String phone;

    private String password;

    private String role; // resident, vendor, security, builder, admin

    private String vendorType; // business, marketplace (optional)

    private String verificationStatus = "not_submitted"; // not_submitted, pending, approved, rejected

    private String approvalStatus = "pending"; // for backward compatibility

    @Column(columnDefinition = "TEXT")
    private String documentsJson;

    private LocalDateTime createdAt = LocalDateTime.now();
}
