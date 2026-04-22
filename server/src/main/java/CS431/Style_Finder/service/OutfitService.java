package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.OutfitDto;

import java.util.List;

public interface OutfitService {
    OutfitDto createOutfit(OutfitDto dto);
    OutfitDto getOutfitById(Long outfitId);
    List<OutfitDto> getOutfitsByUserId(Long userId);
    List<OutfitDto> getSavedOutfitsByUserId(Long userId);
    OutfitDto updateOutfit(Long outfitId, OutfitDto dto);
    OutfitDto markAsSaved(Long outfitId);
    void deleteOutfit(Long outfitId);
    List<OutfitDto> find3Outfits(Long userId);
}