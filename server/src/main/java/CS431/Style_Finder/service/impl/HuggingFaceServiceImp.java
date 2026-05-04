package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.service.HuggingFaceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@Service
public class HuggingFaceServiceImp implements HuggingFaceService {
    private final RestTemplate restTemplate = new RestTemplate();

    private final String HF_API_URL;

    private final String API_SECRET_KEY;

    public HuggingFaceServiceImp(
            @Value("${app.hf.api-url}") String hfApiUrl,
            @Value("${app.hf.api-key}") String apiSecretKey) {
        this.HF_API_URL = hfApiUrl;
        this.API_SECRET_KEY = apiSecretKey;
    }

    @Async
    public void processImageBackground(String filename) {
        System.out.println("Starting background AI processing for: " + filename);

        try {
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("filename", filename);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-API-Key", API_SECRET_KEY);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(HF_API_URL, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println("Successfully processed AI for: " + filename);
            } else {
                System.err.println("AI Processing failed with status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("Error calling Hugging Face API: " + e.getMessage());
        }
    }

}
