package CS431.Style_Finder.integration;

import CS431.Style_Finder.model.*;
import CS431.Style_Finder.model.enums.*;
import CS431.Style_Finder.repository.*;
import CS431.Style_Finder.service.WeatherService;
import CS431.Style_Finder.config.TestSecurityConfig;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.*;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false) 
class AlgorithmIntegrationTest {
    @Autowired private MockMvc mockMvc;

    @LocalServerPort private int port;

    @Autowired private TestRestTemplate restTemplate;

    @Autowired private UserRepository userRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private UserWeightsRepository weightsRepository;

    @MockBean private WeatherService weatherService;

    private String baseUrl(Long userId) {
        return "http://localhost:" + port + "/api/v1/suggestions/hub/" + userId + "?location=NYC&event=Casual&useMemory=false";
    }

    private User createTestUser() {
        User user = new User();

        String unique = UUID.randomUUID().toString().substring(0, 8);

        user.setUsername("testUser_" + unique);
        user.setEmail(unique + "@example.com"); 
        user.setPassword("password");
        user.setRole(Role.USER);

        return userRepository.save(user);
    }

    @Test
    void testGenerateSuggestionHub_fullFlow_success() throws Exception {

        User user = createTestUser();       

        UserWeights weights = new UserWeights();
        weights.setUser(user);
        weights.setThermalBias(1.0);
        weights.setColorHarmonyWeight(1.0);
        weights.setFitWeights(new HashMap<>());
        weights.setPatternWeights(new HashMap<>());
        weights.setMaterialWeights(new HashMap<>());
        weights.setColorWeights(new HashMap<>());
        weightsRepository.save(weights);

        Item top = Item.builder()
                .user(user)
                .type(ItemType.TOP)
                .bulk(10.0)
                .fit(Fit.REGULAR)
                .formality(Formality.CASUAL)
                .pattern(PatternType.SOLID)
                .material(MaterialType.COTTON)
                .colorCategory(ColorCategory.RED)
                .build();

        Item bottom = Item.builder()
                .user(user)
                .type(ItemType.BOTTOM)
                .bulk(10.0)
                .fit(Fit.REGULAR)
                .formality(Formality.CASUAL)
                .pattern(PatternType.SOLID)
                .material(MaterialType.COTTON)
                .colorCategory(ColorCategory.BLACK)
                .build();

        itemRepository.saveAll(List.of(top, bottom));
        when(weatherService.getWeatherForLocation("NYC")).thenReturn(new WeatherService.WeatherContext(70, Weather.SUNNY));

        mockMvc.perform(post("/api/v1/suggestions/hub/" + user.getUserId())
            .contentType("application/json")
            .content("""
                {
                    "location": "NYC",
                    "event": "Casual",
                    "useMemory": false
                }
            """))
        .andDo(print())
        .andExpect(status().isOk());

        // assertEquals(HttpStatus.OK, response.getStatusCode());
        // assertNotNull(response.getBody());
        // assertFalse(response.getBody().isEmpty());
    }

    @Test
    void testGenerateSuggestionHub_emptyCloset() throws Exception {
        User user = createTestUser();
        when(weatherService.getWeatherForLocation("NYC")).thenReturn(new WeatherService.WeatherContext(70, Weather.SUNNY));    
        
        mockMvc.perform(post("/api/v1/suggestions/hub/" + user.getUserId())
            .contentType("application/json")
            .content("""
                {
                    "location": "NYC",
                    "event": "Casual",
                    "useMemory": false
                }
            """))
        .andDo(print())
        .andExpect(status().isOk());
        
        // assertEquals(HttpStatus.OK, response.getStatusCode());
        // // should return empty or safe response (not crash)
        // assertNotNull(response.getBody());
    }
}