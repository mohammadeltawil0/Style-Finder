package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.ItemDto;

import java.util.List;

public interface ItemService {
    ItemDto createItem(ItemDto dto);
    List<ItemDto> getItemsByUserId(Long userId);
    ItemDto updateItem(Long itemId, ItemDto dto);
    void deleteItem(Long itemId);
    void incrementTimesWorn(Long itemId);
    ItemDto getItemsByItemId(Long itemId);
}