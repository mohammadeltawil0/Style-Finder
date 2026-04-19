package CS431.Style_Finder.service;

import java.util.Map;

public interface FileUploadService {
    public Map<String, String> getPresignedUploadUrl(String originalFilename, String contentType);
}
