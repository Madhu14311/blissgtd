package com.bsgated.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * MarketplaceOrder — persisted order placed by a resident.
 *
 * Lifecycle:
 *   pending → accepted → assigned_delivery → out_for_delivery → delivered
 *                      ↘ rejected
 *                                                              ↘ returned
 */
@Entity
@Table(name = "marketplace_orders", indexes = {
        @Index(name = "idx_mo_resident",  columnList = "residentId"),
        @Index(name = "idx_mo_vendor",    columnList = "vendorId"),
        @Index(name = "idx_mo_status",    columnList = "status"),
        @Index(name = "idx_mo_store",     columnList = "storeId")
})
public class MarketplaceOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Resident (buyer) ──────────────────────────────────────────────────────
    @Column(nullable = false)
    private Long residentId;

    @Column(nullable = false, length = 120)
    private String residentName;

    @Column(nullable = false, length = 50)
    private String unit;

    // ── Vendor / Store ────────────────────────────────────────────────────────
    @Column(nullable = false)
    private Long vendorId;

    @Column(nullable = false)
    private Long storeId;

    @Column(nullable = false, length = 120)
    private String storeName;

    // ── Order items (JSON snapshot) ───────────────────────────────────────────
    /** JSON array: [{ productId, name, emoji, price, qty, unit }] */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String itemsJson;

    // ── Financials ────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private Double subtotal;

    @Column(nullable = false)
    private Double deliveryCharge = 20.0;

    @Column(nullable = false)
    private Double total;

    // ── Payment ───────────────────────────────────────────────────────────────
    /** upi | card | cod | razorpay */
    @Column(nullable = false, length = 30)
    private String paymentMethod;

    /** Razorpay payment id (razorpay_payment_id) — null for COD */
    @Column(length = 100)
    private String razorpayPaymentId;

    /** Razorpay order id created by backend */
    @Column(length = 100)
    private String razorpayOrderId;

    /** pending | paid | failed | cod */
    @Column(nullable = false, length = 20)
    private String paymentStatus = "pending";

    // ── Delivery OTP (generated server-side, same as DeliveryPass pattern) ────
    @Column(nullable = false, length = 6)
    private String otp;

    private Boolean otpVerified = false;

    // ── Status ────────────────────────────────────────────────────────────────
    /**
     * pending | accepted | assigned_delivery | out_for_delivery | delivered
     * | rejected | returned
     */
    @Column(nullable = false, length = 30)
    private String status = "pending";

    /** Name of assigned delivery partner (dummy or real) */
    @Column(length = 120)
    private String deliveryPartnerName;

    @Column(length = 20)
    private String deliveryPartnerPhone;

    // ── Timestamps ────────────────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime placedAt = LocalDateTime.now();

    private LocalDateTime acceptedAt;
    private LocalDateTime assignedAt;
    private LocalDateTime outForDeliveryAt;
    private LocalDateTime deliveredAt;

    @PreUpdate
    public void onUpdate() {
        // no-op — individual timestamp fields set explicitly by service
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Long getResidentId() { return residentId; }
    public void setResidentId(Long v) { this.residentId = v; }

    public String getResidentName() { return residentName; }
    public void setResidentName(String v) { this.residentName = v; }

    public String getUnit() { return unit; }
    public void setUnit(String v) { this.unit = v; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long v) { this.vendorId = v; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long v) { this.storeId = v; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String v) { this.storeName = v; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String v) { this.itemsJson = v; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double v) { this.subtotal = v; }

    public Double getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(Double v) { this.deliveryCharge = v; }

    public Double getTotal() { return total; }
    public void setTotal(Double v) { this.total = v; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String v) { this.razorpayPaymentId = v; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String v) { this.razorpayOrderId = v; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String v) { this.paymentStatus = v; }

    public String getOtp() { return otp; }
    public void setOtp(String v) { this.otp = v; }

    public Boolean getOtpVerified() { return otpVerified; }
    public void setOtpVerified(Boolean v) { this.otpVerified = v; }

    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }

    public String getDeliveryPartnerName() { return deliveryPartnerName; }
    public void setDeliveryPartnerName(String v) { this.deliveryPartnerName = v; }

    public String getDeliveryPartnerPhone() { return deliveryPartnerPhone; }
    public void setDeliveryPartnerPhone(String v) { this.deliveryPartnerPhone = v; }

    public LocalDateTime getPlacedAt() { return placedAt; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime v) { this.acceptedAt = v; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime v) { this.assignedAt = v; }

    public LocalDateTime getOutForDeliveryAt() { return outForDeliveryAt; }
    public void setOutForDeliveryAt(LocalDateTime v) { this.outForDeliveryAt = v; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime v) { this.deliveredAt = v; }
}
