package esprit.dialysisservice.services;

import esprit.dialysisservice.dtos.response.ScheduledSessionResponseDTO;
import esprit.dialysisservice.dtos.schedule.ConfirmScheduleRequestDTO;
import esprit.dialysisservice.entities.DialysisTreatment;
import esprit.dialysisservice.entities.ScheduledSession;
import esprit.dialysisservice.entities.enums.ScheduledStatus;
import esprit.dialysisservice.mapper.ScheduledSessionMapper;
import esprit.dialysisservice.repositories.DialysisTreatmentRepository;
import esprit.dialysisservice.repositories.ScheduledSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final DialysisTreatmentRepository treatmentRepository;
    private final ScheduledSessionRepository scheduledRepo;
    private final ScheduledSessionMapper mapper;
    @Transactional
    public List<ScheduledSessionResponseDTO> confirm(ConfirmScheduleRequestDTO req, UUID createdBySub) {

        if (req == null || req.getTreatmentId() == null)
            throw new ResponseStatusException(BAD_REQUEST, "treatmentId required");

        if (req.getSlots() == null || req.getSlots().isEmpty())
            throw new ResponseStatusException(BAD_REQUEST, "slots required");

        DialysisTreatment t = treatmentRepository.findById(req.getTreatmentId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Treatment not found"));

        if (t.getPatientId() == null)
            throw new ResponseStatusException(CONFLICT, "Treatment has no patientId");

        if (t.getStatus() == null || !"ACTIVE".equalsIgnoreCase(t.getStatus().name()))
            throw new ResponseStatusException(CONFLICT, "Treatment not ACTIVE");

        // validate all first
        for (var slot : req.getSlots()) {
            if (slot.getDay() == null || slot.getShift() == null)
                throw new ResponseStatusException(BAD_REQUEST, "day/shift required");

            if (slot.getNurseId() == null)
                throw new ResponseStatusException(BAD_REQUEST, "nurseId required");

            if (slot.getDay().isBefore(LocalDate.now()))
                throw new ResponseStatusException(CONFLICT, "Cannot schedule in the past");

            if (scheduledRepo.existsByTreatmentIdAndDayAndShift(req.getTreatmentId(), slot.getDay(), slot.getShift()))
                throw new ResponseStatusException(CONFLICT, "Already scheduled for that treatment/day/shift");

            // nurse conflict (also block STARTED)
            boolean nurseBusy = scheduledRepo.existsByNurseIdAndDayAndShiftAndStatusIn(
                    slot.getNurseId(),
                    slot.getDay(),
                    slot.getShift(),
                    List.of(ScheduledStatus.SCHEDULED, ScheduledStatus.STARTED)
            );
            if (nurseBusy)
                throw new ResponseStatusException(CONFLICT, "Nurse already scheduled in that slot");
        }

        // create
        List<ScheduledSessionResponseDTO> created = new ArrayList<>();

        for (var slot : req.getSlots()) {
            ScheduledSession s = ScheduledSession.builder()
                    .treatmentId(req.getTreatmentId())
                    .patientId(t.getPatientId()) // <-- FIX (no cast)
                    .day(slot.getDay())
                    .shift(slot.getShift())
                    .nurseId(slot.getNurseId())
                    .status(ScheduledStatus.SCHEDULED)
                    .createdAt(LocalDateTime.now())
                    .createdBy(createdBySub != null ? createdBySub.toString() : null)
                    .build();

            ScheduledSession saved = scheduledRepo.save(s);
            created.add(mapper.toResponse(saved)); // use your mapper
        }

        return created;
    }
    public List<ScheduledSessionResponseDTO> getMyToday(UUID nurseId) {
        return scheduledRepo.findAllByNurseIdAndDayAndStatus(nurseId, LocalDate.now(), ScheduledStatus.SCHEDULED)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
    public List<ScheduledSessionResponseDTO> getMyBetween(UUID nurseId, LocalDate from, LocalDate to) {
        if (from == null || to == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from/to required");
        if (to.isBefore(from)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "to must be >= from");

        return scheduledRepo.findAllByNurseIdAndDayBetweenOrderByDayAscShiftAsc(nurseId, from, to)
                .stream().map(mapper::toResponse).toList();
    }
}