import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function InventoryScreen() {
    return (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ThemedText>Inventory Screen</ThemedText>
        </ThemedView>
    );
}