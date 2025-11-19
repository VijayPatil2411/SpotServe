package com.spotserve.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "mechanic_id")
    private Long mechanicId;

    @Column(name = "pickup_lat")
    private Double pickupLat;

    @Column(name = "pickup_lng")
    private Double pickupLng;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    private String status = "Pending";

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "payment_url", columnDefinition = "TEXT")
    private String paymentUrl;

    // ========================
    // 🔥 NEW FIELDS
    // ========================
    @Column(name = "extra_amount")
    private Double extraAmount = 0.0;

    @Column(name = "total_amount")
    private Double totalAmount = 0.0;

    // Service relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", insertable = false, updatable = false)
    private ServiceEntity service;

    // Transient fields
    @Transient
    private String serviceName;

    @Transient
    private String customerName;

    @Transient
    private String mechanicName;

    @Transient
    private Double baseAmount;

    public Job() {}

    // ===== GETTERS / SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Long getMechanicId() { return mechanicId; }
    public void setMechanicId(Long mechanicId) { this.mechanicId = mechanicId; }

    public Double getPickupLat() { return pickupLat; }
    public void setPickupLat(Double pickupLat) { this.pickupLat = pickupLat; }

    public Double getPickupLng() { return pickupLng; }
    public void setPickupLng(Double pickupLng) { this.pickupLng = pickupLng; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }

    public ServiceEntity getService() { return service; }
    public void setService(ServiceEntity service) { this.service = service; }

    public String getServiceName() {
        if (serviceName != null && !serviceName.isBlank()) return serviceName;
        return (service != null && service.getName() != null)
                ? service.getName()
                : "Unknown Service";
    }

    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getMechanicName() { return mechanicName; }
    public void setMechanicName(String mechanicName) { this.mechanicName = mechanicName; }

    // Base Amount from service table
    public Double getBaseAmount() {
        if (baseAmount != null) return baseAmount;
        if (service != null && service.getBasePrice() != null)
            return service.getBasePrice();
        return 500.0;
    }

    public void setBaseAmount(Double baseAmount) { this.baseAmount = baseAmount; }

    // ========= NEW EXTRA/TOTAL FIELDS ==========

    public Double getExtraAmount() { return extraAmount; }
    public void setExtraAmount(Double extraAmount) { this.extraAmount = extraAmount; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
}
