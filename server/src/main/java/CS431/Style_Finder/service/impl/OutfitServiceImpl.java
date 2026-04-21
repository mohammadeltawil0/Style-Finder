package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.OutfitDto;
import CS431.Style_Finder.exception.ResourceNotFoundException;
import CS431.Style_Finder.mapper.OutfitMapper;
import CS431.Style_Finder.model.*;
import CS431.Style_Finder.repository.ItemRepository;
import CS431.Style_Finder.repository.OutfitRepository;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.service.OutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OutfitServiceImpl implements OutfitService {

    private final OutfitRepository outfitRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final OutfitMapper outfitMapper;

    @Override
    @Transactional
    public OutfitDto createOutfit( OutfitDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));

        Outfit outfit = outfitMapper.toEntity(dto, user);
        Outfit saved = outfitRepository.save(outfit);

        // Link items to the outfit if itemIds were provided
        if (dto.getItemIds() != null && !dto.getItemIds().isEmpty()) {
            for (Long itemId : dto.getItemIds()) {
                Item item = itemRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));
                OutfitItem outfitItem = OutfitItem.builder()
                        .outfit(saved)
                        .item(item)
                        .build();
                saved.getOutfitItems().add(outfitItem);
            }
            outfitRepository.save(saved);
        }

        return outfitMapper.toDto(saved);
    }

    @Override
    public OutfitDto getOutfitById(Long outfitId) {
        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new ResourceNotFoundException("Outfit not found with id: " + outfitId));
        return outfitMapper.toDto(outfit);
    }

    @Override
    public List<OutfitDto> getOutfitsByUserId(Long userId) {
        return outfitRepository.findByUser_UserId(userId)
                .stream().map(outfitMapper::toDto).collect(Collectors.toList());
    }

    @Override
    public List<OutfitDto> getSavedOutfitsByUserId(Long userId) {
        return outfitRepository.findByUser_UserIdAndSavedTrue(userId)
                .stream().map(outfitMapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OutfitDto updateOutfit(Long outfitId, OutfitDto dto) {
        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new ResourceNotFoundException("Outfit not found with id: " + outfitId));
        outfit.setComments(dto.getComments());
        if (dto.getSaved() != null) outfit.setSaved(dto.getSaved());
        return outfitMapper.toDto(outfitRepository.save(outfit));
    }

    @Override
    public OutfitDto markAsSaved(Long outfitId) {
        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new ResourceNotFoundException("Outfit not found with id: " + outfitId));
        outfit.setSaved(true);
        return outfitMapper.toDto(outfitRepository.save(outfit));
    }

    @Override
    public void deleteOutfit(Long outfitId) {
        outfitRepository.findById(outfitId)
                .orElseThrow(() -> new ResourceNotFoundException("Outfit not found with id: " + outfitId));
        outfitRepository.deleteById(outfitId);
    }

    @Override
    public List<OutfitDto> find3Outfits(Long userId) {
        List<Outfit> allOutfits = outfitRepository.findByUser_UserId(userId);
        Collections.shuffle(allOutfits);
        return allOutfits.stream()
                .limit(3)
                .map(outfitMapper::toDto)
                .collect(Collectors.toList());
    }
}