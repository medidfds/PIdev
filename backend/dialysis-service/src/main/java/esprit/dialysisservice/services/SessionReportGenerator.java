package esprit.dialysisservice.services;


import com.fasterxml.jackson.databind.ObjectMapper;
import esprit.dialysisservice.entities.DialysisSession;
import esprit.dialysisservice.entities.DialysisTreatment;
import esprit.dialysisservice.entities.SystemConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class SessionReportGenerator {

    private final ObjectMapper objectMapper;

    public GeneratedReport generate(
            DialysisSession session,
            DialysisTreatment treatment,
            SystemConfig cfg,
            String nurseName,
            String patientName,
            String doctorName
    ) {
        double ktvTh = cfg != null && cfg.getKtvAlertThreshold() != null ? cfg.getKtvAlertThreshold() : 1.2;
        double urrTh = 65.0;

        // Core values
        Double urr = session.getUrr();
        Double spKtV = session.getSpKtV();
        Double eKtV = session.getEKtV();

        boolean urrOk = urr != null && urr >= urrTh;
        boolean ktvOk = spKtV != null && spKtV >= ktvTh;

        boolean adequate = urrOk && ktvOk;

        // UF
        Double uf = null;
        if (session.getWeightBefore() != null && session.getWeightAfter() != null) {
            uf = session.getWeightBefore() - session.getWeightAfter();
        }
        String ufFlag = "NORMAL";
        if (uf != null) {
            if (uf > 3.0) ufFlag = "HIGH_UF";
            else if (uf < 0.5) ufFlag = "LOW_UF";
        }

        // Recommendations (rule-based)
        List<String> rec = new ArrayList<>();
        if (!ktvOk) rec.add("Low spKt/V: consider prescription review (duration/frequency) and check vascular access.");
        if (!urrOk) rec.add("Low URR: verify sampling timing and evaluate clearance/access issues.");
        if ("HIGH_UF".equals(ufFlag)) rec.add("High ultrafiltration: review dry weight and interdialytic weight gain.");
        if ("LOW_UF".equals(ufFlag)) rec.add("Low ultrafiltration: verify target dry weight and fluid intake assessment.");
        if (session.getComplications() != null && !session.getComplications().isBlank()) {
            rec.add("Complications noted: ensure clinical follow-up.");
        }
        if (rec.isEmpty()) rec.add("No alerts. Continue current prescription and monitoring.");

        // JSON structure
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("generatedAt", LocalDateTime.now().toString());

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("sessionId", String.valueOf(session.getId()));
        summary.put("sessionDate", session.getSessionDate() != null ? session.getSessionDate().toString() : null);
        summary.put("shift", session.getShift() != null ? session.getShift().toString() : null);

      // IDs kept (optional)
        summary.put("nurseId", session.getNurseId() != null ? session.getNurseId().toString() : null);
        summary.put("patientId", treatment.getPatientId() != null ? treatment.getPatientId().toString() : null);
        summary.put("doctorId", treatment.getDoctorId() != null ? treatment.getDoctorId().toString() : null);

     // Display labels (use these in UI)
        summary.put("nurseName", nurseName);
        summary.put("patientName", patientName);
        summary.put("doctorName", doctorName);

        json.put("summary", summary);

        Map<String, Object> treatmentInfo = new LinkedHashMap<>();
        treatmentInfo.put("treatmentId", String.valueOf(treatment.getId()));
        treatmentInfo.put("dialysisType", String.valueOf(treatment.getDialysisType()));
        treatmentInfo.put("accessType", String.valueOf(treatment.getVascularAccessType()));
        treatmentInfo.put("frequencyPerWeek", treatment.getFrequencyPerWeek());
        treatmentInfo.put("prescribedDurationMinutes", treatment.getPrescribedDurationMinutes());
        treatmentInfo.put("targetDryWeight", treatment.getTargetDryWeight());
        json.put("treatment", treatmentInfo);

        Map<String, Object> adequacyBlock = new LinkedHashMap<>();
        adequacyBlock.put("urr", urr);
        adequacyBlock.put("spKtV", spKtV);
        adequacyBlock.put("eKtV", eKtV);
        adequacyBlock.put("urrThreshold", urrTh);
        adequacyBlock.put("ktvThreshold", ktvTh);
        adequacyBlock.put("urrPass", urrOk);
        adequacyBlock.put("ktvPass", ktvOk);
        adequacyBlock.put("overallAdequate", adequate);
        json.put("adequacy", adequacyBlock);

        Map<String, Object> fluid = new LinkedHashMap<>();
        fluid.put("weightBefore", session.getWeightBefore());
        fluid.put("weightAfter", session.getWeightAfter());
        fluid.put("ultrafiltrationVolume", session.getUltrafiltrationVolume());
        fluid.put("calculatedUF", uf);
        fluid.put("flag", ufFlag);
        json.put("fluid", fluid);

        Map<String, Object> hemo = new LinkedHashMap<>();
        hemo.put("bloodPressure", session.getPreBloodPressure());
        hemo.put("complications", session.getComplications());
        json.put("hemodynamics", hemo);

        json.put("recommendations", rec);

        // Text rendering (printable)
        String text = buildText(session, treatment, ktvTh, urrTh, urrOk, ktvOk, adequate, uf, ufFlag, rec,
                nurseName, patientName, doctorName);
        try {
            String jsonStr = objectMapper.writeValueAsString(json);
            return new GeneratedReport(jsonStr, text, ktvTh, urrTh);
        } catch (Exception e) {
            // fallback: never fail endSession due to report serialization
            String fallbackJson = "{\"error\":\"failed_to_serialize_report\"}";
            return new GeneratedReport(fallbackJson, text, ktvTh, urrTh);
        }
    }

    private String buildText(
            DialysisSession s,
            DialysisTreatment t,
            double ktvTh,
            double urrTh,
            boolean urrOk,
            boolean ktvOk,
            boolean adequate,
            Double uf,
            String ufFlag,
            List<String> rec,
            String nurseName,
            String patientName,
            String doctorName
    ) {

        StringBuilder sb = new StringBuilder();
        sb.append("Dialysis Session Report\n");
        sb.append("======================\n");
        sb.append("Session: ").append(s.getId()).append("\n");
        sb.append("Date: ").append(s.getSessionDate()).append(" | Shift: ").append(s.getShift()).append("\n");
        sb.append("Patient: ").append(patientName).append("\n");
        sb.append("Doctor: ").append(doctorName).append("\n");
        sb.append("Nurse: ").append(nurseName).append("\n\n");

        sb.append("Treatment\n");
        sb.append("- Type: ").append(t.getDialysisType()).append("\n");
        sb.append("- Access: ").append(t.getVascularAccessType()).append("\n");
        sb.append("- Frequency/week: ").append(t.getFrequencyPerWeek()).append("\n");
        sb.append("- Prescribed duration (min): ").append(t.getPrescribedDurationMinutes()).append("\n");
        sb.append("- Target dry weight: ").append(t.getTargetDryWeight()).append("\n\n");

        sb.append("Adequacy\n");
        sb.append("- URR: ").append(s.getUrr()).append("% (target >= ").append(urrTh).append(") -> ").append(urrOk ? "PASS" : "FAIL").append("\n");
        sb.append("- spKt/V: ").append(s.getSpKtV()).append(" (target >= ").append(ktvTh).append(") -> ").append(ktvOk ? "PASS" : "FAIL").append("\n");
        sb.append("- eKt/V: ").append(s.getEKtV()).append("\n");
        sb.append("- Overall: ").append(adequate ? "ADEQUATE" : "INADEQUATE").append("\n\n");

        sb.append("Fluid\n");
        sb.append("- Weight before: ").append(s.getWeightBefore()).append(" | Weight after: ").append(s.getWeightAfter()).append("\n");
        sb.append("- UF calc (before-after): ").append(uf).append(" | Flag: ").append(ufFlag).append("\n");
        sb.append("- UF volume field: ").append(s.getUltrafiltrationVolume()).append("\n\n");

        sb.append("Hemodynamics / Notes\n");
        sb.append("- BP: ").append(s.getPreBloodPressure()).append("\n");
        sb.append("- Complications: ").append(s.getComplications()).append("\n\n");

        sb.append("Recommendations\n");
        for (String r : rec) sb.append("- ").append(r).append("\n");

        return sb.toString();
    }

    public record GeneratedReport(String jsonStr, String text, double ktvThreshold, double urrThreshold) {}
}