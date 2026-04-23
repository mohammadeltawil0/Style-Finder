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

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SharedOutfitServiceImpl implements SharedOutfitService {

    private final SharedOutfitRepository sharedOutfitRepository;
    private final OutfitRepository outfitRepository;

    @Override
    public SharedOutfitDto createShareLink(Long outfitId) {

        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new RuntimeException("Outfit not found"));

        //reuse existing link if already created
        Optional<SharedOutfit> existing =
                sharedOutfitRepository.findByOutfit_OutfitId(outfitId);

        if (existing.isPresent()) {
            return buildDto(existing.get());
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
    public OutfitDto getSharedOutfit(String token) {

        SharedOutfit shared = sharedOutfitRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid share link"));

        if (!shared.isActive()) {
            throw new RuntimeException("This link has been disabled");
        }

        sharedOutfitRepository.save(shared);

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
                .shareLink("https://api.stylefinder.tech/api/share/" + shared.getShareToken())
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
                .itemIds(
                    outfit.getOutfitItems() != null
                        ? outfit.getOutfitItems().stream()
                            .map(outfitItem -> outfitItem.getItem().getItemId())
                            .toList()
                        : null
                )
                .build();
    }
}