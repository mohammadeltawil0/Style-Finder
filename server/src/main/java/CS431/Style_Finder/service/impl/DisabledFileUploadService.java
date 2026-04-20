package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.service.FileUploadService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@ConditionalOnProperty(prefix = "b2", name = "enabled", havingValue = "false", matchIfMissing = true)
public class DisabledFileUploadService implements FileUploadService {

    @Override
    public Map<String, String> getPresignedUploadUrl(String originalFilename, String contentType) {
        throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "File upload is disabled. Set b2.enabled=true and configure B2 credentials to enable uploads."
        );
    }
}
