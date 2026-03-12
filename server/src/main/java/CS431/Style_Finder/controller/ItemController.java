package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.ItemDto;
import CS431.Style_Finder.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    // POST /api/items
    // Body: { "userId":1, "type":"TOP", "color":"black", "formality":"CASUAL",
    //         "seasonWear":"SUMMER", "fit":"SLIM", "material":2 }
    @PostMapping
    public ResponseEntity<ItemDto> createItem(@RequestBody ItemDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemService.createItem(dto));
    }

    // GET /api/items/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ItemDto> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    // GET /api/items/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ItemDto>> getItemsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(itemService.getItemsByUserId(userId));
    }

    // PUT /api/items/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ItemDto> updateItem(@PathVariable Long id, @RequestBody ItemDto dto) {
        return ResponseEntity.ok(itemService.updateItem(id, dto));
    }

    // DELETE /api/items/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok("Item deleted successfully.");
    }

    // PATCH /api/items/{id}/worn  — increments timesWorn counter
    @PatchMapping("/{id}/worn")
    public ResponseEntity<String> markWorn(@PathVariable Long id) {
        itemService.incrementTimesWorn(id);
        return ResponseEntity.ok("Times worn updated.");
    }
}
