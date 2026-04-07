package CS431.Style_Finder.exception;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateUsernameException.class)
    public ResponseEntity<ApiError> handleDuplicateUsername(DuplicateUsernameException ex) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(new ApiError(409, "Conflict", ex.getMessage()));
    }

    @ExceptionHandler(InvalidUserDataException.class)
    public ResponseEntity<ApiError> handleInvalidUserData(InvalidUserDataException ex) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ApiError(400, "Bad Request", ex.getMessage()));
    }

    @ExceptionHandler(UserCreationException.class)
    public ResponseEntity<ApiError> handleUserCreation(UserCreationException ex) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiError(500, "Internal Server Error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationErrors(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ApiError(400, "Validation Failed", message));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)  // 401
            .body(new ApiError(401, "Unauthorized", ex.getMessage()));
    }
}