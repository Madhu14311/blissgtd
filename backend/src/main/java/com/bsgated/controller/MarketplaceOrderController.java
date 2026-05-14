package com.bsgated.controller;

import com.bsgated.dto.PlaceOrderRequest;
import com.bsgated.model.MarketplaceOrder;
import com.bsgated.service.MarketplaceOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Marketplace Order lifecycle:
 *
 * POST   /api/marketplace/orders                    — resident places order
 * GET    /api/marketplace/orders/my                 — resident gets own orders
 *
 * GET    /api/vendor/orders                         — vendor gets all their orders
 * GET    /api/vendor/orders?status=pending          — filtered by status
 * PUT    /api/vendor/orders/{id}/accept             — accept
 * PUT    /api/vendor/orders/{id}/reject             — reject
 * PUT    /api/vendor/orders/{id}/assign-delivery    — assign delivery partner
 * PUT    /api/vendor/orders/{id}/out-for-delivery   — mark out for delivery
 * PUT    /api/vendor/orders/{id}/delivered          — mark delivered
 */
@RestController
public class MarketplaceOrderController {

    private final MarketplaceOrderService service;

    public MarketplaceOrderController(MarketplaceOrderService service) {
        this.service = service;
    }

    // ── Resident endpoints ────────────────────────────────────────────────────

    @PostMapping(value = "/api/marketplace/orders", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> placeOrder(@Valid @RequestBody PlaceOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.placeOrder(req));
    }

    @GetMapping(value = "/api/marketplace/orders/my", produces = "application/json")
    public ResponseEntity<List<MarketplaceOrder>> getMyOrders() {
        return ResponseEntity.ok(service.getMyOrders());
    }

    // ── Vendor endpoints ──────────────────────────────────────────────────────

    @GetMapping(value = "/api/vendor/orders", produces = "application/json")
    public ResponseEntity<List<MarketplaceOrder>> getVendorOrders(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(service.getVendorOrdersByStatus(status.trim()));
        }
        return ResponseEntity.ok(service.getVendorOrders());
    }

    @PutMapping(value = "/api/vendor/orders/{id}/accept", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> acceptOrder(@PathVariable Long id) {
        return ResponseEntity.ok(service.acceptOrder(id));
    }

    @PutMapping(value = "/api/vendor/orders/{id}/reject", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> rejectOrder(@PathVariable Long id) {
        return ResponseEntity.ok(service.rejectOrder(id));
    }

    @PutMapping(value = "/api/vendor/orders/{id}/assign-delivery", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> assignDelivery(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.assignDelivery(id, body));
    }

    @PutMapping(value = "/api/vendor/orders/{id}/out-for-delivery", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> markOutForDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(service.markOutForDelivery(id));
    }

    @PutMapping(value = "/api/vendor/orders/{id}/delivered", produces = "application/json")
    public ResponseEntity<MarketplaceOrder> markDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(service.markDelivered(id));
    }
}
