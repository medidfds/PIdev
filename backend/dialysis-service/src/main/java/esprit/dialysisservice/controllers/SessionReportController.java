package esprit.dialysisservice.controllers;


import esprit.dialysisservice.dtos.response.SessionReportResponseDTO;
import esprit.dialysisservice.services.SessionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class SessionReportController {

    private final SessionReportService reportService;

    // Doctor/Admin: report by sessionId (doctor restricted to own patients)
    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasAnyRole('admin','ADMIN','doctor','DOCTOR')")
    public ResponseEntity<SessionReportResponseDTO> getReportForDoctorAdmin(
            @PathVariable UUID sessionId,
            Authentication authentication
    ) {
        UUID userId = extractUserId(authentication);
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_admin") || a.getAuthority().equals("ROLE_ADMIN")
        );

        return ResponseEntity.ok(reportService.getBySessionIdDoctorAdmin(sessionId, userId, isAdmin));
    }

    // Patient: only own report
    @GetMapping("/my/session/{sessionId}")
    @PreAuthorize("hasAnyRole('patient','PATIENT')")
    public ResponseEntity<SessionReportResponseDTO> getMyReport(
            @PathVariable UUID sessionId,
            Authentication authentication
    ) {
        UUID patientId = extractUserId(authentication);
        return ResponseEntity.ok(reportService.getBySessionIdPatient(sessionId, patientId));
    }

    // Adjust this to your existing extraction helper (you already have extractUserId in some controllers)
    private UUID extractUserId(Authentication authentication) {
        JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
        return UUID.fromString(jwtAuth.getToken().getSubject());
    }
}