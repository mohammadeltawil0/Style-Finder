package CS431.Style_Finder;

import CS431.Style_Finder.model.User;
import CS431.Style_Finder.model.enums.Role;
import CS431.Style_Finder.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.SpringApplication;

@SpringBootApplication
public class StyleFinderApplication {

	public static void main(String[] args) {
		System.setProperty("aws.java.v1.disableDeprecationAnnouncement", "true");
		SpringApplication.run(StyleFinderApplication.class, args);
	}

	@Bean
    CommandLineRunner initAdmin(UserRepository userRepo, PasswordEncoder encoder) {
        return args -> {
            if (!userRepo.existsByUsername("hpAdmin@13")) {
                User admin = new User();
                admin.setUsername("hpAdmin@13");
                admin.setPassword(encoder.encode("honey1Admin@26")); // change if needed
                admin.setRole(Role.ADMIN);
                userRepo.save(admin);
                System.out.println("Admin user created");
            } else {
                System.out.println("Admin already exists");
            }
        };
    }
}
