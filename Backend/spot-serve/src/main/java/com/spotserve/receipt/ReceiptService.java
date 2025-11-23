package com.spotserve.receipt;

import com.spotserve.model.Job;
import com.spotserve.model.ServiceEntity;
import com.spotserve.model.User;
import com.spotserve.model.Vehicle;
import com.spotserve.repository.JobRepository;
import com.spotserve.repository.ServiceRepository;
import com.spotserve.repository.UserRepository;
import com.spotserve.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReceiptService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public ReceiptDto getReceiptForJob(Long jobId, Long customerId) {

        // Fetch job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Validate ownership
        if (!job.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Unauthorized: This job does not belong to this customer");
        }

        // Fetch related data
        ServiceEntity service = serviceRepository.findById(job.getServiceId())
                .orElse(null);

        User customer = userRepository.findById(job.getCustomerId())
                .orElse(null);

        User mechanic = userRepository.findById(job.getMechanicId())
                .orElse(null);

        Vehicle vehicle = vehicleRepository.findById(job.getVehicleId())
                .orElse(null);

        // Calculate amounts (service may be deleted)
        double baseAmount = (service != null && service.getBasePrice() != null)
                ? service.getBasePrice()
                : 0.0;

        double extraAmount = (job.getExtraAmount() != null)
                ? job.getExtraAmount()
                : 0.0;

        double totalAmount = baseAmount + extraAmount;

        // Build DTO
        ReceiptDto dto = new ReceiptDto();
        dto.setJobId(job.getId());
        dto.setStatus(job.getStatus());
        dto.setCreatedAt(job.getCreatedAt());

        // FIX: provide fallback values if service is deleted
        dto.setServiceName(service != null ? service.getName() : "Unknown Service");

        // Customer (always exists normally)
        dto.setCustomerId(customer != null ? customer.getId() : null);
        dto.setCustomerName(customer != null ? customer.getName() : "Unknown Customer");

        // Mechanic may be null
        dto.setMechanicId(mechanic != null ? mechanic.getId() : null);
        dto.setMechanicName(mechanic != null ? mechanic.getName() : "Not Assigned");

        // Vehicle
        dto.setVehicleId(vehicle != null ? vehicle.getId() : null);
        dto.setVehiclePlateNo(vehicle != null ? vehicle.getPlateNo() : "Unknown");

        dto.setBaseAmount(baseAmount);
        dto.setExtraAmount(extraAmount);
        dto.setTotalAmount(totalAmount);

        return dto;
    }
}
