package esprit.dialysisservice.services;


import com.fasterxml.jackson.databind.ObjectMapper;
import esprit.dialysisservice.dtos.response.SessionReportResponseDTO;
import esprit.dialysisservice.entities.*;
import esprit.dialysisservice.repositories.SessionReportRepository;
import esprit.dialysisservice.repositories.DialysisSessionRepository;
import esprit.dialysisservice.repositories.DialysisTreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionReportService {

    private final SessionReportRepository reportRepo;
    private final ObjectMapper objectMapper;
    private final SessionReportGenerator generator;

    private final DialysisSessionRepository sessionRepo;
    private final DialysisTreatmentRepository treatmentRepo;
    private final UserLabelService userLabelService;

    @Transactional
    public SessionReportResponseDTO generateAndSave(UUID sessionId, UUID generatedBy, SystemConfig cfg) {
        DialysisSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        DialysisTreatment treatment = session.getTreatment();
        if (treatment == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Session has no treatment");
        }

        if (treatment.getPatientId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Treatment has no patientId");
        }
        String nurseName = userLabelService.label(session.getNurseId());
        String patientName = userLabelService.label(treatment.getPatientId());
        String doctorName = userLabelService.label(treatment.getDoctorId()); // optional

        var gen = generator.generate(session, treatment, cfg, nurseName, patientName, doctorName);
        SessionReport report = reportRepo.findBySessionId(sessionId).orElseGet(() -> SessionReport.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .treatmentId(treatment.getId())
                .patientId(treatment.getPatientId())
                .build());

        report.setGeneratedAt(LocalDateTime.now());
        report.setGeneratedBy(generatedBy);
        report.setKtvThreshold(gen.ktvThreshold());
        report.setUrrThreshold(gen.urrThreshold());
        report.setReportJson(gen.jsonStr());
        report.setReportText(gen.text());

        SessionReport saved = reportRepo.save(report);

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public SessionReportResponseDTO getBySessionIdDoctorAdmin(UUID sessionId, UUID requesterUserId, boolean isAdmin) {
        SessionReport report = reportRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found for session"));

        if (isAdmin) return toDto(report);

        // Doctor restriction: only if doctor owns that treatment
        DialysisTreatment t = treatmentRepo.findById(report.getTreatmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Treatment not found"));

        if (t.getDoctorId() == null || !t.getDoctorId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view reports of your patients.");
        }
        return toDto(report);
    }

    @Transactional(readOnly = true)
    public SessionReportResponseDTO getBySessionIdPatient(UUID sessionId, UUID patientIdFromJwt) {
        SessionReport report = reportRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found for session"));

        if (!report.getPatientId().equals(patientIdFromJwt)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view your own reports.");
        }
        return toDto(report);
    }

    private SessionReportResponseDTO toDto(SessionReport r) {
        Object jsonObj;
        try {
            jsonObj = objectMapper.readValue(r.getReportJson(), Object.class);
        } catch (Exception e) {
            jsonObj = r.getReportJson();
        }

        return SessionReportResponseDTO.builder()
                .id(r.getId())
                .sessionId(r.getSessionId())
                .treatmentId(r.getTreatmentId())
                .patientId(r.getPatientId())
                .generatedAt(r.getGeneratedAt())
                .generatedBy(r.getGeneratedBy())
                .ktvThreshold(r.getKtvThreshold())
                .urrThreshold(r.getUrrThreshold())
                .reportJson(jsonObj)
                .reportText(r.getReportText())
                .build();
    }
}