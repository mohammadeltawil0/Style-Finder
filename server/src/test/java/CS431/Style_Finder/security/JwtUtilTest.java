package CS431.Style_Finder.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil();

    @Test
    void testGenerateAndExtractUsernameAndRole() {
        String username = "stella123";
        String role = "USER";

        String token = jwtUtil.generateToken(username, role);

        assertNotNull(token);

        String extractedUsername = jwtUtil.extractUsername(token);
        String extractedRole = jwtUtil.extractRole(token);

        assertEquals(username, extractedUsername);
        assertEquals(role, extractedRole);
    }

    @Test
    void testInvalidToken() {
        String fakeToken = "invalid.token.value";

        assertThrows(Exception.class, () -> {
            jwtUtil.extractUsername(fakeToken);
        });
    }
}