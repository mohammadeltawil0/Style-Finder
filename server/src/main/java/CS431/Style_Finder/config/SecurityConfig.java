package CS431.Style_Finder.config;

import CS431.Style_Finder.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            //PUBLIC (no token required)
            .requestMatchers(
                "/api/users/login",
                "/api/users/register",
                "/api/users/check-username",
                "/api/users/reset-password",
                "/api/share/**"
            ).permitAll()

            //ADMIN ONLY
            .requestMatchers("/api/admin/**").hasRole("ADMIN")

            //USER + ADMIN
            .requestMatchers(
                "/api/preferences/**",
                "/api/items/**",
                "/api/outfits/**",
                "/api/trips/**"
            ).hasAnyRole("USER", "ADMIN")

            //EVERYTHING ELSE
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}