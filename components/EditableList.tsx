import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Edit2, Trash2 } from 'lucide-react-native';

interface EditableListProps {
  items: any[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
  emptyText?: string;
}

export default function EditableList({
  items,
  onAdd,
  onEdit,
  onRemove,
  renderItem,
  emptyText = "No items added yet"
}: EditableListProps) {
  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemContent}>
              {renderItem(item, index)}
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                onPress={() => onEdit(index)}
                style={styles.actionButton}
              >
                <Edit2 size={16} color="#282A32" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onRemove(index)}
                style={styles.actionButton}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      
      <TouchableOpacity onPress={onAdd} style={styles.addButton}>
        <Plus size={20} color="#282A32" />
        <Text style={styles.addButtonText}>Add New</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemContent: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#282A32',
    fontSize: 14,
    fontWeight: '600',
  },
});

