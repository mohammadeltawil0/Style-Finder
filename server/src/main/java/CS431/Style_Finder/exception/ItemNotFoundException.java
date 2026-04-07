package CS431.Style_Finder.exception;

public class ItemNotFoundException extends RuntimeException {
    public ItemNotFoundException(Long itemId) {
        super("Item not found with id: " + itemId);
    }
}