package com.spotserve.repository;


import com.spotserve.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
}