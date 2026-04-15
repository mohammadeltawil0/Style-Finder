package CS431.Style_Finder.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil();

    @Test
    void testGenerateAndExtractUsername() {
        String username = "stella1234";

        String token = jwtUtil.generateToken(username);

        assertNotNull(token);

        String extractedUsername = jwtUtil.extractUsername(token);

        assertEquals(username, extractedUsername);
    }

    @Test
    void testInvalidToken() {
        String fakeToken = "invalid.token.value";

        assertThrows(Exception.class, () -> {
            jwtUtil.extractUsername(fakeToken);
        });
    }
}