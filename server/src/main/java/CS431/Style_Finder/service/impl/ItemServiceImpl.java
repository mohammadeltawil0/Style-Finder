package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.ItemDto;
import CS431.Style_Finder.exception.ResourceNotFoundException;
import CS431.Style_Finder.mapper.ItemMapper;
import CS431.Style_Finder.model.Item;
import CS431.Style_Finder.model.User;

import CS431.Style_Finder.repository.ItemRepository;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ItemMapper itemMapper;

    @Override
    public ItemDto createItem(ItemDto dto) {
        User user = userRepository.findByUserId(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));
        Item saved = itemRepository.save(itemMapper.toEntity(dto, user));

        return itemMapper.toDto(saved);
    }

    @Override
    public ItemDto getItemsByItemId(Long itemId) {
        Item item = itemRepository.findByItemId(itemId)
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
        item.setLength(dto.getLength());
        item.setMaterial(dto.getMaterial());
        item.setSeasonWear(dto.getSeasonWear());
        item.setFormality(dto.getFormality());
        item.setFit(dto.getFit());
        if (dto.getImageUrl() != null) item.setImageUrl(dto.getImageUrl());
        return itemMapper.toDto(itemRepository.save(item));
    }

    @Override
    public void deleteItem(Long itemId) {
        itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));
        itemRepository.deleteById(itemId);
    }

    @Override
    public void incrementTimesWorn(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));
        item.setTimesWorn(item.getTimesWorn() == null ? 1 : item.getTimesWorn() + 1);
        itemRepository.save(item);
    }
}