package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.service.FileUploadService;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "b2", name = "enabled", havingValue = "true")
public class FileUploadServiceImp implements FileUploadService {
    private final AmazonS3 s3Client;

    @Value("${b2.bucketName}")
    private String bucketName;

    @Value("${b2.endpoint}")
    private String endpoint;

    public Map<String, String> getPresignedUploadUrl(String originalFilename, String contentType) {
        // 1. Generate a unique filename
        String extension = "";
        if (contentType.startsWith("image/"))
            extension = "." + contentType.substring(contentType.lastIndexOf("/") + 1);
        else extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID() + extension;

        // 2. Set expiration time for the URL
        Date expiration = new Date();
        long expTimeMillis = expiration.getTime() + (1000 * 60 * 15);
        expiration.setTime(expTimeMillis);

        // 3. Generate the Pre-signed URL for a PUT request
        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, newFilename)
                        .withMethod(HttpMethod.PUT)
                        .withExpiration(expiration);

        URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);

        // 4. Construct the final public URL that the image WILL have after upload
        String finalPublicUrl = "https://hub.stylefinder.tech/" + newFilename;

        // 5. Return both the temporary upload URL and the final public URL
        Map<String, String> response = new HashMap<>();
        response.put("uploadUrl", url.toString());
        response.put("publicUrl", finalPublicUrl);

        return response;
    }
}
