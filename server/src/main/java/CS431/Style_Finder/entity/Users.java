package CS431.Style_Finder.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Entity
@Table(name = "users")
public class Users {
    // --- Getters and Setters ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false, unique = true)
    private String username;

    @Setter
    @Column(nullable = false, unique = true)
    private String email;

    @Setter
    @Column(nullable = false)
    private String password; // We will store hashed passwords here later!

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // This method automatically sets the timestamp right before the row is inserted
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- Constructors ---
    public Users() {} // JPA requires a default no-args constructor

    public Users(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

}

