package com.spotserve.receipt;

import java.time.Instant;

public class ReceiptDto {

    private Long jobId;
    private String status;
    private String serviceName;

    private Long mechanicId;
    private String mechanicName;

    private Long customerId;
    private String customerName;

    private Long vehicleId;
    private String vehiclePlateNo;

    private Instant createdAt;

    private Double baseAmount;
    private Double extraAmount;
    private Double totalAmount;

    private String paymentUrl;

    // ===== Getters & Setters =====

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public Long getMechanicId() { return mechanicId; }
    public void setMechanicId(Long mechanicId) { this.mechanicId = mechanicId; }

    public String getMechanicName() { return mechanicName; }
    public void setMechanicName(String mechanicName) { this.mechanicName = mechanicName; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getVehiclePlateNo() { return vehiclePlateNo; }
    public void setVehiclePlateNo(String vehiclePlateNo) { this.vehiclePlateNo = vehiclePlateNo; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Double getBaseAmount() { return baseAmount; }
    public void setBaseAmount(Double baseAmount) { this.baseAmount = baseAmount; }

    public Double getExtraAmount() { return extraAmount; }
    public void setExtraAmount(Double extraAmount) { this.extraAmount = extraAmount; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
}
