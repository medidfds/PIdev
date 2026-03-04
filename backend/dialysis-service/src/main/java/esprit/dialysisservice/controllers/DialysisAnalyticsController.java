package esprit.dialysisservice.controllers;


import esprit.dialysisservice.dtos.response.DialysisSeriesPointDTO;
import esprit.dialysisservice.dtos.response.PatientWeeklyAdequacyDTO;
import esprit.dialysisservice.services.IDialysisAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class DialysisAnalyticsController {

    private final IDialysisAnalyticsService analyticsService;

    @GetMapping("/treatment/{treatmentId}/series")
    @PreAuthorize("hasAnyRole('admin','ADMIN','doctor','DOCTOR','nurse','NURSE')")
    public ResponseEntity<List<DialysisSeriesPointDTO>> treatmentSeries(
            @PathVariable UUID treatmentId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getTreatmentSeries(treatmentId, limit));
    }

    @GetMapping("/patient/{patientId}/weekly")
    @PreAuthorize("hasAnyRole('admin','ADMIN','doctor','DOCTOR','nurse','NURSE')")
    public ResponseEntity<List<PatientWeeklyAdequacyDTO>> patientWeekly(
            @PathVariable UUID patientId,
            @RequestParam(defaultValue = "8") int weeks
    ) {
        return ResponseEntity.ok(analyticsService.getPatientWeeklyAdequacy(patientId, weeks));
    }
}