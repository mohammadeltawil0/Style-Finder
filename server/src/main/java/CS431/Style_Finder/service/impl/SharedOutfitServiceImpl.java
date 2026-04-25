package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.OutfitDto;
import CS431.Style_Finder.dto.SharedOutfitDto;
import CS431.Style_Finder.model.Outfit;
import CS431.Style_Finder.model.SharedOutfit;
import CS431.Style_Finder.repository.OutfitRepository;
import CS431.Style_Finder.repository.SharedOutfitRepository;
import CS431.Style_Finder.service.SharedOutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SharedOutfitServiceImpl implements SharedOutfitService {

    private final SharedOutfitRepository sharedOutfitRepository;
    private final OutfitRepository outfitRepository;
    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public SharedOutfitDto createShareLink(Long outfitId) {

        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new RuntimeException("Outfit not found"));

        //reuse existing link if already created
        Optional<SharedOutfit> existing =
                sharedOutfitRepository.findByOutfit_OutfitId(outfitId);

        if (existing.isPresent()) {
            SharedOutfit shared = existing.get();

            if (!shared.isActive()) {
                shared.setActive(true);
                sharedOutfitRepository.save(shared);
            }

            return buildDto(shared);
        }

        String token = UUID.randomUUID().toString();

        SharedOutfit shared = SharedOutfit.builder()
                .outfit(outfit)
                .shareToken(token)
                .createdAt(LocalDateTime.now())
                .active(true)
                //.viewCount(0)
                .build();

        sharedOutfitRepository.save(shared);

        return buildDto(shared);
    }

    @Override
    @Transactional
    public OutfitDto getSharedOutfit(String token) {

        SharedOutfit shared = sharedOutfitRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid share link"));

        if (!shared.isActive()) {
            throw new RuntimeException("This link has been disabled");
        }

        return mapToOutfitDto(shared.getOutfit());
    }

    @Override
    public void revokeShareLink(String token) {

        SharedOutfit shared = sharedOutfitRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid share link"));

        shared.setActive(false);
        sharedOutfitRepository.save(shared);
    }

    private SharedOutfitDto buildDto(SharedOutfit shared) {
        return SharedOutfitDto.builder()
                .shareLink(baseUrl + "/api/share/view/" + shared.getShareToken())
                //.shareLink("exp://192.168.1.31:8081/--/share/" + token)
                .token(shared.getShareToken())
                .outfitId(shared.getOutfit().getOutfitId())
                .build();
    }

    private OutfitDto mapToOutfitDto(Outfit outfit) {
        return OutfitDto.builder()
        .outfitId(outfit.getOutfitId())
        .userId(outfit.getUser() != null ? outfit.getUser().getUserId() : null)
        .saved(outfit.getSaved())
        .createdAt(outfit.getCreatedAt())
        .itemIds(outfit.getOutfitItems() != null ? outfit.getOutfitItems().stream().map(oi -> oi.getItem().getItemId()).toList() : null)
        .imageUrls(outfit.getOutfitItems() != null ? outfit.getOutfitItems().stream().map(oi -> oi.getItem().getImageUrl()).toList() : null)

        // optional: main image
        .coverImageUrl(outfit.getOutfitItems() != null && !outfit.getOutfitItems().isEmpty() ? outfit.getOutfitItems().get(0).getItem().getImageUrl() : null)
        .build();
    }
}