package CS431.Style_Finder.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
@ConditionalOnProperty(prefix = "b2", name = "enabled", havingValue = "true")
public class B2Config {

    @Value("${b2.accessKeyId}")
    private String accessKey;

    @Value("${b2.secretKey}")
    private String secretKey;

    @Value("${b2.endpoint}")
    private String endpoint;

    @Bean
    public AmazonS3 s3Client() {
        BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);

        // Region doesn't matter much for B2, but the SDK requires one. We extract it from the endpoint.
        String region = Arrays.toString(endpoint.split("\\."));

        return AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(
                        "https://" + endpoint, region))
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .build();
    }
}