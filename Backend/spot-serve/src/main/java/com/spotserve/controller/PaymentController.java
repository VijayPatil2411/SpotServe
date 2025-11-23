package com.spotserve.controller;

import com.spotserve.model.Job;
import com.spotserve.repository.JobRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    private final JobRepository jobRepository;

    public PaymentController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    /**
     * Mechanic completes job → create Stripe payment URL
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> requestData) {
        try {
            Stripe.apiKey = stripeSecretKey;

            Long jobId = Long.parseLong(requestData.get("jobId").toString());
            String description = (String) requestData.getOrDefault("description", "Service Payment");

            double baseAmount = Double.parseDouble(requestData.get("baseAmount").toString());
            double extraAmount = Double.parseDouble(requestData.getOrDefault("extraAmount", 0).toString());

            double total = baseAmount + extraAmount;
            long totalAmount = Math.round(total * 100);

            // Create Stripe checkout session
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("http://localhost:3000/payment-success?jobId=" + jobId)
                    .setCancelUrl("http://localhost:3000/payment-cancel")
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("inr")
                                                    .setUnitAmount(totalAmount)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("SpotServe Service Payment")
                                                                    .setDescription(description)
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            Session session = Session.create(params);

            // 🔥 Save amount + payment URL + status
            Optional<Job> jobOpt = jobRepository.findById(jobId);
            if (jobOpt.isPresent()) {
                Job job = jobOpt.get();

                job.setExtraAmount(extraAmount);       // <-- FIX 1
                job.setTotalAmount(total);             // <-- FIX 2
                job.setPaymentUrl(session.getUrl());   // <-- already exists
                job.setStatus("PAYMENT_PENDING");

                jobRepository.save(job);               // <-- FIX 3 (persist)
            }

            Map<String, Object> response = new HashMap<>();
            response.put("checkoutUrl", session.getUrl());
            response.put("message", "Payment link created and saved for customer.");

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create payment session"));
        }
    }

    /**
     * Customer completed payment → mark job as Completed
     */
    @PostMapping("/mark-success")
    public ResponseEntity<?> markPaymentSuccess(@RequestParam Long jobId) {

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isPresent()) {
            Job job = jobOpt.get();

            job.setStatus("Completed");
            job.setPaymentUrl(null);

            jobRepository.save(job);
            return ResponseEntity.ok(Map.of("message", "Job marked as Completed after successful payment."));
        }

        return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
    }
}
