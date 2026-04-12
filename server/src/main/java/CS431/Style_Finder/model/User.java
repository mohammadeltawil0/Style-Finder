package CS431.Style_Finder.model;

import CS431.Style_Finder.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Lob
    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // One-to-One with Preference
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Preference preference;

    // One-to-One with user weights
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserWeights userWeights;

    // One-to-Many with Item
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Item> items = new ArrayList<>();

    // One-to-Many with Outfit
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Outfit> outfits = new ArrayList<>();

    // One-to-Many with Trip
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Trip> trips = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (role == null) role = Role.USER;
    }
}