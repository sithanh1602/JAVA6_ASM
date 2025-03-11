package com.be.controller;

import com.be.dto.BuildPCResponseDTO;
import com.be.service.BuildPCService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildPC")
public class BuildPCController {

    @Autowired
    private BuildPCService buildPCService;


    @PostMapping("/create")
    public ResponseEntity<String> createBuildPC(@RequestBody BuildPCResponseDTO request) {
        buildPCService.createBuildPC(request);
        return ResponseEntity.ok("Build PC created successfully!");
    }

    @GetMapping("/all")
    public List<BuildPCResponseDTO> getAllBuildPC() {
        return buildPCService.getAllBuildPC();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateBuildPC(@PathVariable Long id, @RequestBody BuildPCResponseDTO request) {
        buildPCService.updateBuildPC(id, request);
        return ResponseEntity.ok("Build PC updated successfully!");
    }

}
