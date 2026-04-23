package CS431.Style_Finder.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/* This is a temporary class for encoding passwords
* i.e., if you want to access old accounts, put your password, run and compile, get the hashed password and add to db
* compile: ./mvnw compile, run: ./mvnw exec:java -Dexec.mainClass="CS431.Style_Finder.config.temp"
*/
public class temp {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("password12@")); // change if needed
    }
}