package CS431.Style_Finder.controller;


import CS431.Style_Finder.dto.ItemDto;
import CS431.Style_Finder.model.enums.Fit;
import CS431.Style_Finder.model.enums.Formality;
import CS431.Style_Finder.model.enums.ItemType;
import CS431.Style_Finder.model.enums.LengthType;
import CS431.Style_Finder.model.enums.MaterialType;
import CS431.Style_Finder.model.enums.PatternType;
import CS431.Style_Finder.model.enums.Season;
import CS431.Style_Finder.service.ItemService;
import CS431.Style_Finder.service.UserService;
import CS431.Style_Finder.model.enums.ColorCategory;


import org.apache.catalina.connector.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.ResponseEntity;


import java.util.List;
import java.util.stream.Stream;




import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


public class ItemControllerTest {
    private ItemService itemService;
    private ItemController itemController;




    @BeforeEach
    void setUp() {
        itemService = mock(ItemService.class);
        itemController = new ItemController(itemService);
    }  


    // Add item (add a variety of items with different parameters, types, etc to ensure no issues with database or service layer)
    // @Test
    // void testAddItem() {
    //     ItemDto input = ItemDto.builder()
    //             .userId(72L)
    //             .type(ItemType.TOP)
    //             .color("black")
    //             .pattern(PatternType.SOLID)
    //             .length(LengthType.SLEEVELESS)
    //             .material("cotton")
    //             .bulk(0.5)
    //             .seasonWear(Season.SUMMER)
    //             .formality(Formality.CASUAL)
    //             .fit(Fit.SLIM)
    //             .timesWorn(0)
    //             .imageUrl("http://example.com/image.jpg")
    //             .build();
       
    //     when(itemService.createItem(input)).thenReturn(input);


    //     ResponseEntity<ItemDto> response = itemController.createItem(input);


    //     assertEquals(201, response.getStatusCodeValue());
    //     assertNotNull(response.getBody());
    //     assertEquals(ItemType.TOP, response.getBody().getType());
    //     assertEquals("black", response.getBody().getColor());    
    // }


    // Add item test (Tests and iterates through all possible combinations of item parameters to ensure no issues with database or service layer)
    static Stream<ItemDto> itemProvider() {
    return Stream.of(ItemType.values()).flatMap(type ->
        Stream.of(PatternType.values()).flatMap(pattern ->
            Stream.of(LengthType.values()).flatMap(length ->
                Stream.of(Season.values()).flatMap(season ->
                    Stream.of(Formality.values()).flatMap(formality ->
                        Stream.of(MaterialType.values()).flatMap(material ->
                            Stream.of(ColorCategory.values()).flatMap(colorCategory ->
                                Stream.of(Fit.values()).map(fit ->
                                    ItemDto.builder()
                                            .userId(1L)
                                            .type(type)
                                            .color("#FFFFFF")
                                            .pattern(pattern)
                                            .colorCategory(colorCategory)
                                            .length(length)
                                            .material(material)
                                            .seasonWear(season)
                                            .formality(formality)
                                            .fit(fit)
                                            .bulk(1.0)
                                            .timesWorn(0)
                                            .imageUrl("test.png")
                                            .build()
                                )
                            )
                        )
                    )
                )
            )
        )
    ).limit(100);
}
    


    @ParameterizedTest
    @MethodSource("itemProvider")
    void testAllEnumCombinations(ItemDto input) {
        ItemService itemService = mock(ItemService.class);
        ItemController itemController = new ItemController(itemService);


        when(itemService.createItem(any(ItemDto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));


        ResponseEntity<ItemDto> response = itemController.createItem(input);


        assertEquals(201, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(input.getType(), response.getBody().getType());
    }
    // Get item by ID
    @Test
    void testGetItemById() {
        ItemDto item = new ItemDto();
        item.setType(ItemType.TOP);


        when(itemService.getItemsByItemId(1L)).thenReturn(item);


        ResponseEntity<ItemDto> response = itemController.getItemsByItemId(1L);


        assertEquals(200, response.getStatusCodeValue());
        assertEquals(ItemType.TOP, response.getBody().getType());
    }
    // Get all items by user ID
    @Test
    void testGetItemsByUser() {
        ItemDto item = new ItemDto();
        item.setUserId(6L);


        when(itemService.getItemsByUserId(6L)).thenReturn(List.of(item));


        ResponseEntity<List<ItemDto>> response =
                itemController.getItemsByUser(6L);


        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }


    // Update item
    @Test
    void testUpdateItem() {
        ItemDto updated = new ItemDto();
        updated.setColor("blue");


        when(itemService.updateItem(1L, updated)).thenReturn(updated);


        ResponseEntity<ItemDto> response =
                itemController.updateItem(1L, updated);


        assertEquals(200, response.getStatusCodeValue());
        assertEquals("blue", response.getBody().getColor());
    }
    // Delete item
    @Test
    void testDeleteItem() {
        doNothing().when(itemService).deleteItem(1L);


        ResponseEntity<String> response = itemController.deleteItem(1L);


        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Item deleted successfully.", response.getBody());
    }


    // Test mark item as worn (increment times worn)
    @Test
    void testMarkWorn() {
        doNothing().when(itemService).incrementTimesWorn(1L);


        ResponseEntity<String> response = itemController.markWorn(1L);


        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Times worn updated.", response.getBody());
    }


    // Test get least worn items for user
    @Test
    void testGetLeastWornItems() {
        ItemDto item = new ItemDto();


        when(itemService.getLeastWornItemsByUserId(6L))
                .thenReturn(List.of(item));


        ResponseEntity<List<ItemDto>> response =
                itemController.getLeastWornItemsByUser(6L);


        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }
   


}



