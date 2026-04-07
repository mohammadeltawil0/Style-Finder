package CS431.Style_Finder.exception;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ItemNotFoundException.class)
    public ResponseEntity<ApiError> handleItemNotFound(ItemNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)  // 404
            .body(new ApiError(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(ItemCreationException.class)
    public ResponseEntity<ApiError> handleItemCreation(ItemCreationException ex) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)  // 500
            .body(new ApiError(500, "Internal Server Error", ex.getMessage()));
    }

    @ExceptionHandler(InvalidUserDataException.class)
    public ResponseEntity<ApiError> handleInvalidUserData(InvalidUserDataException ex) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ApiError(400, "Bad Request", ex.getMessage()));
    }

   @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)  // 404
            .body(new ApiError(404, "Not Found", ex.getMessage()));
    }
}