package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.ItemDto;
import CS431.Style_Finder.exception.ResourceNotFoundException;
import CS431.Style_Finder.exception.InvalidUserDataException;
import CS431.Style_Finder.exception.ItemCreationException;

import CS431.Style_Finder.mapper.ItemMapper;
import CS431.Style_Finder.model.Item;
import CS431.Style_Finder.model.User;
import CS431.Style_Finder.model.enums.ItemType;

import CS431.Style_Finder.repository.ItemRepository;
import CS431.Style_Finder.repository.OutfitItemRepository;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final OutfitItemRepository outfitItemRepository;
    private final UserRepository userRepository;
    private final ItemMapper itemMapper;

    @Override
    public ItemDto createItem(ItemDto dto) {
        if (dto == null) {
            throw new InvalidUserDataException("Item data cannot be null");
        }

        if (dto.getUserId() == null) {
            throw new InvalidUserDataException("User ID is required");
        }

        if (dto.getType() == null) {
            throw new InvalidUserDataException("Item type is required");
        }

        User user = userRepository.findById(dto.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));

        try {
            Item saved = itemRepository.save(itemMapper.toEntity(dto, user));
            return itemMapper.toDto(saved);
        } catch (Exception e) {
            throw new ItemCreationException("Failed to create item", e);
        }
    }

    @Override
    public ItemDto getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));
        return itemMapper.toDto(item);
    }

    @Override
    public List<ItemDto> getItemsByUserId(Long userId) {
        return itemRepository.findByUser_UserId(userId)
                .stream()
                .map(itemMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ItemDto updateItem(Long itemId, ItemDto dto) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));
        item.setType(dto.getType());
        item.setColor(dto.getColor());
        item.setPattern(dto.getPattern());
        item.setLength(dto.getLength());
        item.setMaterial(dto.getMaterial());
        item.setBulk(dto.getBulk());
        item.setSeasonWear(dto.getSeasonWear());
        item.setFormality(dto.getFormality());
        item.setFit(dto.getFit());
        if (dto.getImageUrl() != null) item.setImageUrl(dto.getImageUrl());
        return itemMapper.toDto(itemRepository.save(item));
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId) {
        itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        // Remove dependent rows in join table to satisfy FK constraint before deleting the item.
        outfitItemRepository.deleteByItem_ItemId(itemId);
        itemRepository.deleteById(itemId);
    }

    @Override
    public void incrementTimesWorn(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));
        item.setTimesWorn(item.getTimesWorn() == null ? 1 : item.getTimesWorn() + 1);
        itemRepository.save(item);
    }

    @Override
    public List<ItemDto> searchItems(String search, ItemType type, Long userId) {
        return itemRepository.findAll().stream()
        .filter(item -> userId == null || item.getUser().getUserId().equals(userId))
        .filter(item -> type == null || item.getType() == type)
        .filter(item -> {
            if (search == null || search.isBlank()) return true;

            String text = (
                item.getType() + " " +
                item.getColor() + " " +
                item.getSeasonWear() + " " +
                item.getFormality()
            ).toLowerCase();
            return text.contains(search.toLowerCase());
        })
        .map(itemMapper::toDto)
        .toList();
    }
}